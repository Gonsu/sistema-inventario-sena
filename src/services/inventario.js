// ============================================================
// Reglas de negocio del inventario: solicitudes, aprobaciones,
// devoluciones, evidencias y edición de contratos.
//
// Cada función lee los datos MÁS RECIENTES del localStorage (no los de
// React) antes de guardar, para no borrar cambios hechos en otra pestaña.
// Si algo no es válido, la función lanza un Error con un mensaje para el usuario.
// ============================================================

// Importar constantes del sistema
import { PRESUPUESTO_MAX_SOLICITUD, STORAGE_KEYS } from '../utils/constants';

// Importar el formato de pesos y el generador de identificadores
import { formatCOP } from '../utils/format';
import { generarId } from '../utils/id';

// Importar las funciones para leer y guardar en localStorage
import { readJSON, writeMany } from './storage';

// Atajos para leer cada lista guardada en el navegador
const leer = {
  contratos: () => readJSON(STORAGE_KEYS.contratos, []),
  items: () => readJSON(STORAGE_KEYS.items, []),
  asignaciones: () => readJSON(STORAGE_KEYS.asignaciones, []),
  movimientos: () => readJSON(STORAGE_KEYS.movimientos, []),
  solicitudes: () => readJSON(STORAGE_KEYS.solicitudes, []),
  evidencias: () => readJSON(STORAGE_KEYS.evidencias, []),
};

// Crea un registro para el historial con id y fecha automáticos
function nuevoMovimiento(datos) {
  return { id: generarId(), fecha: new Date().toISOString(), ...datos };
}

// Calcula el estado de un material: si quedan unidades está "disponible", si no "en uso".
// Los estados de mantenimiento y dado de baja no se cambian.
function estadoSegunDisponibilidad(item) {
  if (item.estado === 'mantenimiento' || item.estado === 'dado_de_baja') return item.estado;
  return item.cantidadDisponible > 0 ? 'disponible' : 'en_uso';
}

// Suma cantidad × valor unitario de cada línea
export function calcularTotal(lineas) {
  return lineas.reduce((acc, l) => acc + l.cantidad * l.valorUnitario, 0);
}

// ------------------------------------------------------------
// Solicitudes
// ------------------------------------------------------------

// Crea una solicitud de materiales del instructor (queda "pendiente" de aprobación)
export function crearSolicitud(input) {
  // 1. Validar el formulario, el PDF y que haya materiales
  const { formulario, formatoPdf } = input;
  if (!formulario.nombre.trim() || !formulario.apellido.trim() || !formulario.programa.trim()) {
    throw new Error('Completa nombre, apellido y programa de formación.');
  }
  if (!formatoPdf || formatoPdf.mimeType !== 'application/pdf') {
    throw new Error('Debes adjuntar el formato oficial en PDF.');
  }
  if (input.lineas.length === 0) throw new Error('Selecciona al menos un material.');

  // 2. Revisar cada material: que exista y que haya unidades suficientes
  const items = leer.items();
  const lineas = input.lineas.map(({ itemId, cantidad }) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) throw new Error('Uno de los materiales ya no existe en el inventario.');
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      throw new Error(`Cantidad inválida para ${item.nombre}.`);
    }
    if (cantidad > item.cantidadDisponible) {
      throw new Error(
        `Solo hay ${item.cantidadDisponible} unidad(es) disponibles de ${item.nombre}.`,
      );
    }
    return { itemId, cantidad, valorUnitario: item.valorUnitario };
  });

  // 3. Revisar que no se pase del tope de $3.000.000
  const valorTotal = calcularTotal(lineas);
  if (valorTotal > PRESUPUESTO_MAX_SOLICITUD) {
    throw new Error(
      `El total (${formatCOP(valorTotal)}) supera el máximo permitido de ${formatCOP(PRESUPUESTO_MAX_SOLICITUD)}.`,
    );
  }

  // 4. Armar la solicitud
  const ahora = Date.now();
  const solicitud = {
    id: generarId(),
    numero: input.numero ?? `SOL-${ahora}`,
    instructorId: input.instructorId,
    items: lineas,
    valorTotal,
    formulario: {
      ...formulario,
      nombre: formulario.nombre.trim(),
      apellido: formulario.apellido.trim(),
      programa: formulario.programa.trim(),
    },
    formatoPdf,
    estado: 'pendiente',
    creadaEn: new Date(ahora).toISOString(),
    resueltaEn: null,
    resueltaPor: null,
  };

  // 5. Registrar el movimiento en el historial
  const movimiento = nuevoMovimiento({
    tipo: 'solicitud_creada',
    usuarioId: input.instructorId,
    instructorId: input.instructorId,
    solicitudId: solicitud.id,
    detalle: lineas.map(({ itemId, cantidad }) => ({ itemId, cantidad })),
    observacion: `Solicitud ${solicitud.numero} por ${formatCOP(valorTotal)}`,
  });

  // 6. Guardar todo junto
  writeMany([
    [STORAGE_KEYS.solicitudes, [...leer.solicitudes(), solicitud]],
    [STORAGE_KEYS.movimientos, [...leer.movimientos(), movimiento]],
  ]);
  return solicitud;
}

// Acepta una solicitud pendiente (la usa el administrativo):
// descuenta el inventario, le asigna los materiales al instructor
// y registra la salida en el historial.
export function aceptarSolicitud(solicitudId, adminId) {
  // Buscar la solicitud y verificar que siga pendiente
  const solicitudes = leer.solicitudes();
  const solicitud = solicitudes.find((s) => s.id === solicitudId);
  if (!solicitud) throw new Error('La solicitud ya no existe.');
  if (solicitud.estado !== 'pendiente') throw new Error('La solicitud ya fue procesada.');

  const items = leer.items();
  const ahora = new Date().toISOString();

  // Validar que haya unidades suficientes ANTES de cambiar cualquier cosa
  for (const linea of solicitud.items) {
    const item = items.find((i) => i.id === linea.itemId);
    if (!item) throw new Error('Uno de los materiales solicitados ya no existe.');
    if (item.cantidadDisponible < linea.cantidad) {
      throw new Error(
        `Existencias insuficientes de ${item.nombre}: disponibles ${item.cantidadDisponible}, solicitadas ${linea.cantidad}.`,
      );
    }
  }

  // Descontar del inventario las cantidades entregadas
  const itemsActualizados = items.map((item) => {
    const linea = solicitud.items.find((l) => l.itemId === item.id);
    if (!linea) return item;
    const actualizado = {
      ...item,
      cantidadDisponible: item.cantidadDisponible - linea.cantidad,
      actualizadoEn: ahora,
    };
    return { ...actualizado, estado: estadoSegunDisponibilidad(actualizado) };
  });

  // Crear las asignaciones: desde ahora el instructor tiene estos materiales
  const nuevasAsignaciones = solicitud.items.map((linea) => ({
    id: generarId(),
    itemId: linea.itemId,
    instructorId: solicitud.instructorId,
    solicitudId: solicitud.id,
    cantidad: linea.cantidad,
    ubicacionActual: `Ambiente — ${solicitud.formulario.programa}`,
    fechaAsignacion: ahora,
    fechaDevolucion: null,
  }));

  // Registrar la salida en el historial
  const movimiento = nuevoMovimiento({
    tipo: 'asignacion',
    usuarioId: adminId,
    instructorId: solicitud.instructorId,
    solicitudId: solicitud.id,
    detalle: solicitud.items.map(({ itemId, cantidad }) => ({
      itemId,
      cantidad,
    })),
    observacion: `Solicitud ${solicitud.numero} aceptada`,
  });

  // Guardar todo junto y marcar la solicitud como aprobada
  writeMany([
    [STORAGE_KEYS.items, itemsActualizados],
    [STORAGE_KEYS.asignaciones, [...leer.asignaciones(), ...nuevasAsignaciones]],
    [
      STORAGE_KEYS.solicitudes,
      solicitudes.map((s) =>
        s.id === solicitudId
          ? {
              ...s,
              estado: 'aprobada',
              resueltaEn: ahora,
              resueltaPor: adminId,
            }
          : s,
      ),
    ],
    [STORAGE_KEYS.movimientos, [...leer.movimientos(), movimiento]],
  ]);
}

// ------------------------------------------------------------
// Devoluciones
// ------------------------------------------------------------

// Registra la devolución de materiales a bodega por parte de un instructor
export function devolverMateriales(instructorId, lineas) {
  const lineasValidas = lineas.filter((l) => l.cantidad > 0);
  if (lineasValidas.length === 0) throw new Error('Selecciona al menos un material para devolver.');

  // Copias de los datos que se van a modificar
  const ahora = new Date().toISOString();
  let asignaciones = leer.asignaciones();
  const nuevas = [];
  let items = leer.items();

  // Procesar cada material devuelto
  for (const { itemId, cantidad } of lineasValidas) {
    // Asignaciones que el instructor aún tiene de este material (de la más antigua a la más reciente)
    const activas = asignaciones
      .filter(
        (a) => a.instructorId === instructorId && a.itemId === itemId && a.fechaDevolucion === null,
      )
      .sort((a, b) => a.fechaAsignacion.localeCompare(b.fechaAsignacion));
    const asignado = activas.reduce((acc, a) => acc + a.cantidad, 0);
    const item = items.find((i) => i.id === itemId);
    if (!Number.isInteger(cantidad) || cantidad > asignado) {
      throw new Error(
        `No puedes devolver ${cantidad} unidad(es) de ${item?.nombre ?? 'este material'}; tienes ${asignado}.`,
      );
    }

    // Cerrar asignaciones empezando por la más antigua (primero en entrar, primero en salir).
    // Si se devuelve solo una parte, la asignación se divide en dos para no perder el rastro.
    let pendiente = cantidad;
    for (const a of activas) {
      if (pendiente === 0) break;
      if (a.cantidad <= pendiente) {
        pendiente -= a.cantidad;
        asignaciones = asignaciones.map((x) =>
          x.id === a.id ? { ...x, fechaDevolucion: ahora } : x,
        );
      } else {
        asignaciones = asignaciones.map((x) =>
          x.id === a.id ? { ...x, cantidad: x.cantidad - pendiente } : x,
        );
        nuevas.push({
          ...a,
          id: generarId(),
          cantidad: pendiente,
          fechaDevolucion: ahora,
        });
        pendiente = 0;
      }
    }

    // Devolver las unidades al inventario
    items = items.map((i) => {
      if (i.id !== itemId) return i;
      const actualizado = {
        ...i,
        cantidadDisponible: Math.min(i.cantidadTotal, i.cantidadDisponible + cantidad),
        actualizadoEn: ahora,
      };
      return { ...actualizado, estado: estadoSegunDisponibilidad(actualizado) };
    });
  }

  // Registrar la entrada en el historial
  const movimiento = nuevoMovimiento({
    tipo: 'devolucion',
    usuarioId: instructorId,
    instructorId,
    detalle: lineasValidas,
    observacion: 'Devolución de materiales a bodega',
  });

  // Guardar todo junto
  writeMany([
    [STORAGE_KEYS.asignaciones, [...asignaciones, ...nuevas]],
    [STORAGE_KEYS.items, items],
    [STORAGE_KEYS.movimientos, [...leer.movimientos(), movimiento]],
  ]);
}

// ------------------------------------------------------------
// Evidencias
// ------------------------------------------------------------

// Guarda una evidencia fotográfica de un material
export function registrarEvidencia(input) {
  // Validar los datos
  if (!input.itemId) throw new Error('Selecciona el material al que corresponde la evidencia.');
  if (!input.archivo) throw new Error('Adjunta o toma una foto como evidencia.');
  if (!input.descripcion.trim()) throw new Error('Escribe un mensaje describiendo la evidencia.');

  // Armar la evidencia
  const evidencia = {
    id: generarId(),
    itemId: input.itemId,
    instructorId: input.instructorId,
    tipo: input.tipo,
    descripcion: input.descripcion.trim(),
    archivo: input.archivo,
    nombreArchivo: input.nombreArchivo,
    mimeType: input.archivo.slice(5, input.archivo.indexOf(';')) || 'image/jpeg',
    cargadaEn: new Date().toISOString(),
  };
  const movimiento = nuevoMovimiento({
    tipo: 'evidencia_cargada',
    usuarioId: input.instructorId,
    instructorId: input.instructorId,
    itemId: input.itemId,
    observacion: `Evidencia de tipo "${input.tipo}"`,
  });
  // Guardar la evidencia y el movimiento
  writeMany([
    [STORAGE_KEYS.evidencias, [...leer.evidencias(), evidencia]],
    [STORAGE_KEYS.movimientos, [...leer.movimientos(), movimiento]],
  ]);
  return evidencia;
}

// ------------------------------------------------------------
// Configuración de contratos
// ------------------------------------------------------------

// Guarda los cambios de un contrato y de sus materiales.
// Devuelve la lista de cambios registrados (vacía si no hubo cambios).
export function actualizarContrato(contratoId, datos, ediciones, usuarioId) {
  // Buscar el contrato y validar los datos obligatorios
  const contratos = leer.contratos();
  const contrato = contratos.find((c) => c.id === contratoId);
  if (!contrato) throw new Error('El contrato ya no existe.');
  if (!datos.numeroContrato.trim() || !datos.proveedor.trim()) {
    throw new Error('El número de contrato y el proveedor son obligatorios.');
  }

  const ahora = new Date().toISOString();
  // Lista de cambios en texto, para mostrar en el historial (ej: "Proveedor: A → B")
  const cambios = [];
  const registrar = (prefijo, campo, antes, despues) => {
    if (antes !== despues) cambios.push(`${prefijo}${campo}: ${antes} → ${despues}`);
  };

  const items = leer.items();
  // Aplicar los cambios a cada material del contrato (validando cada dato)
  const itemsActualizados = items.map((item) => {
    const ed = ediciones.find((e) => e.id === item.id);
    if (!ed || item.contratoId !== contratoId) return item;

    const nombre = ed.nombre.trim();
    if (!nombre) throw new Error(`El ítem ${item.codigo} debe tener nombre.`);
    if (!Number.isInteger(ed.valorUnitario) || ed.valorUnitario < 0) {
      throw new Error(`Valor unitario inválido en ${item.codigo}.`);
    }
    const enUso = item.cantidadTotal - item.cantidadDisponible;
    if (!Number.isInteger(ed.cantidadTotal) || ed.cantidadTotal < enUso) {
      throw new Error(
        `${item.codigo}: la cantidad no puede ser menor a las ${enUso} unidad(es) en uso.`,
      );
    }

    const p = `[${item.codigo}] `;
    registrar(p, 'Nombre', item.nombre, nombre);
    registrar(p, 'Cantidad', item.cantidadTotal, ed.cantidadTotal);
    registrar(p, 'Valor unitario', formatCOP(item.valorUnitario), formatCOP(ed.valorUnitario));
    registrar(p, 'Ubicación', item.ubicacion, ed.ubicacion.trim());

    const actualizado = {
      ...item,
      nombre,
      valorUnitario: ed.valorUnitario,
      cantidadTotal: ed.cantidadTotal,
      cantidadDisponible: ed.cantidadTotal - enUso,
      ubicacion: ed.ubicacion.trim(),
      actualizadoEn: ahora,
    };
    return { ...actualizado, estado: estadoSegunDisponibilidad(actualizado) };
  });

  // Recalcular el presupuesto del contrato
  const presupuesto = itemsActualizados
    .filter((i) => i.contratoId === contratoId)
    .reduce((acc, i) => acc + i.valorUnitario * i.cantidadTotal, 0);

  // Comparar los datos generales del contrato
  registrar('', 'N° contrato', contrato.numeroContrato, datos.numeroContrato.trim());
  registrar('', 'Proveedor', contrato.proveedor, datos.proveedor.trim());
  registrar('', 'Fecha fin', contrato.fechaFin.slice(0, 10), datos.fechaFin);
  registrar('', 'Presupuesto', formatCOP(contrato.presupuesto), formatCOP(presupuesto));

  // Si no cambió nada, no se guarda nada
  if (cambios.length === 0) return cambios;

  const contratoActualizado = {
    ...contrato,
    numeroContrato: datos.numeroContrato.trim(),
    proveedor: datos.proveedor.trim(),
    fechaFin:
      datos.fechaFin === contrato.fechaFin.slice(0, 10)
        ? contrato.fechaFin
        : new Date(datos.fechaFin).toISOString(),
    presupuesto,
    actualizadoEn: ahora,
  };

  // Registrar los cambios en el historial
  const movimiento = nuevoMovimiento({
    tipo: 'contrato_actualizado',
    usuarioId,
    contratoId,
    cambios,
    observacion: `Contrato ${contrato.nombre} actualizado`,
  });

  // Guardar todo junto
  writeMany([
    [STORAGE_KEYS.items, itemsActualizados],
    [STORAGE_KEYS.contratos, contratos.map((c) => (c.id === contratoId ? contratoActualizado : c))],
    [STORAGE_KEYS.movimientos, [...leer.movimientos(), movimiento]],
  ]);
  return cambios;
}
