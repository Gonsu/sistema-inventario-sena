// ============================================================
// Operaciones de dominio. Cada operación lee el estado MÁS RECIENTE de
// localStorage (no el estado de React) antes de escribir, para no pisar
// cambios hechos desde otra pestaña entre dos ciclos de polling.
// ============================================================

import type {
  ArchivoAdjunto,
  Asignacion,
  Contrato,
  Evidencia,
  EvidenciaTipo,
  ItemContrato,
  Movimiento,
  MovimientoDetalle,
  Solicitud,
  SolicitudFormulario,
} from '../types';
import { PRESUPUESTO_MAX_SOLICITUD, STORAGE_KEYS } from '../utils/constants';
import { formatCOP } from '../utils/format';
import { generarId } from '../utils/id';
import { readJSON, writeMany } from './storage';

const leer = {
  contratos: () => readJSON<Contrato[]>(STORAGE_KEYS.contratos, []),
  items: () => readJSON<ItemContrato[]>(STORAGE_KEYS.items, []),
  asignaciones: () => readJSON<Asignacion[]>(STORAGE_KEYS.asignaciones, []),
  movimientos: () => readJSON<Movimiento[]>(STORAGE_KEYS.movimientos, []),
  solicitudes: () => readJSON<Solicitud[]>(STORAGE_KEYS.solicitudes, []),
  evidencias: () => readJSON<Evidencia[]>(STORAGE_KEYS.evidencias, []),
};

function nuevoMovimiento(datos: Omit<Movimiento, 'id' | 'fecha'>): Movimiento {
  return { id: generarId(), fecha: new Date().toISOString(), ...datos };
}

function estadoSegunDisponibilidad(item: ItemContrato): ItemContrato['estado'] {
  if (item.estado === 'mantenimiento' || item.estado === 'dado_de_baja') return item.estado;
  return item.cantidadDisponible > 0 ? 'disponible' : 'en_uso';
}

export function calcularTotal(lineas: Array<{ cantidad: number; valorUnitario: number }>): number {
  return lineas.reduce((acc, l) => acc + l.cantidad * l.valorUnitario, 0);
}

// ------------------------------------------------------------
// Solicitudes
// ------------------------------------------------------------

export interface NuevaSolicitudInput {
  instructorId: string;
  lineas: Array<{ itemId: string; cantidad: number }>;
  formulario: SolicitudFormulario;
  formatoPdf: ArchivoAdjunto | null;
  /** Número mostrado en el formato; si falta se genera como SOL-timestamp. */
  numero?: string;
}

export function crearSolicitud(input: NuevaSolicitudInput): Solicitud {
  const { formulario, formatoPdf } = input;
  if (!formulario.nombre.trim() || !formulario.apellido.trim() || !formulario.programa.trim()) {
    throw new Error('Completa nombre, apellido y programa de formación.');
  }
  if (!formatoPdf || formatoPdf.mimeType !== 'application/pdf') {
    throw new Error('Debes adjuntar el formato oficial en PDF.');
  }
  if (input.lineas.length === 0) throw new Error('Selecciona al menos un material.');

  const items = leer.items();
  const lineas = input.lineas.map(({ itemId, cantidad }) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) throw new Error('Uno de los materiales ya no existe en el inventario.');
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      throw new Error(`Cantidad inválida para ${item.nombre}.`);
    }
    if (cantidad > item.cantidadDisponible) {
      throw new Error(`Solo hay ${item.cantidadDisponible} unidad(es) disponibles de ${item.nombre}.`);
    }
    return { itemId, cantidad, valorUnitario: item.valorUnitario };
  });

  const valorTotal = calcularTotal(lineas);
  if (valorTotal > PRESUPUESTO_MAX_SOLICITUD) {
    throw new Error(
      `El total (${formatCOP(valorTotal)}) supera el máximo permitido de ${formatCOP(PRESUPUESTO_MAX_SOLICITUD)}.`,
    );
  }

  const ahora = Date.now();
  const solicitud: Solicitud = {
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

  const movimiento = nuevoMovimiento({
    tipo: 'solicitud_creada',
    usuarioId: input.instructorId,
    instructorId: input.instructorId,
    solicitudId: solicitud.id,
    detalle: lineas.map(({ itemId, cantidad }) => ({ itemId, cantidad })),
    observacion: `Solicitud ${solicitud.numero} por ${formatCOP(valorTotal)}`,
  });

  writeMany([
    [STORAGE_KEYS.solicitudes, [...leer.solicitudes(), solicitud]],
    [STORAGE_KEYS.movimientos, [...leer.movimientos(), movimiento]],
  ]);
  return solicitud;
}

/**
 * Acepta una solicitud pendiente: descuenta inventario, crea las asignaciones
 * del instructor, registra la salida en el historial y la saca de la cola.
 */
export function aceptarSolicitud(solicitudId: string, adminId: string): void {
  const solicitudes = leer.solicitudes();
  const solicitud = solicitudes.find((s) => s.id === solicitudId);
  if (!solicitud) throw new Error('La solicitud ya no existe.');
  if (solicitud.estado !== 'pendiente') throw new Error('La solicitud ya fue procesada.');

  const items = leer.items();
  const ahora = new Date().toISOString();

  // Validar existencias antes de modificar nada.
  for (const linea of solicitud.items) {
    const item = items.find((i) => i.id === linea.itemId);
    if (!item) throw new Error('Uno de los materiales solicitados ya no existe.');
    if (item.cantidadDisponible < linea.cantidad) {
      throw new Error(
        `Existencias insuficientes de ${item.nombre}: disponibles ${item.cantidadDisponible}, solicitadas ${linea.cantidad}.`,
      );
    }
  }

  const itemsActualizados = items.map((item) => {
    const linea = solicitud.items.find((l) => l.itemId === item.id);
    if (!linea) return item;
    const actualizado = { ...item, cantidadDisponible: item.cantidadDisponible - linea.cantidad, actualizadoEn: ahora };
    return { ...actualizado, estado: estadoSegunDisponibilidad(actualizado) };
  });

  const nuevasAsignaciones: Asignacion[] = solicitud.items.map((linea) => ({
    id: generarId(),
    itemId: linea.itemId,
    instructorId: solicitud.instructorId,
    solicitudId: solicitud.id,
    cantidad: linea.cantidad,
    ubicacionActual: `Ambiente — ${solicitud.formulario.programa}`,
    fechaAsignacion: ahora,
    fechaDevolucion: null,
  }));

  const movimiento = nuevoMovimiento({
    tipo: 'asignacion',
    usuarioId: adminId,
    instructorId: solicitud.instructorId,
    solicitudId: solicitud.id,
    detalle: solicitud.items.map(({ itemId, cantidad }) => ({ itemId, cantidad })),
    observacion: `Solicitud ${solicitud.numero} aceptada`,
  });

  writeMany([
    [STORAGE_KEYS.items, itemsActualizados],
    [STORAGE_KEYS.asignaciones, [...leer.asignaciones(), ...nuevasAsignaciones]],
    [
      STORAGE_KEYS.solicitudes,
      solicitudes.map((s) =>
        s.id === solicitudId ? { ...s, estado: 'aprobada' as const, resueltaEn: ahora, resueltaPor: adminId } : s,
      ),
    ],
    [STORAGE_KEYS.movimientos, [...leer.movimientos(), movimiento]],
  ]);
}

// ------------------------------------------------------------
// Devoluciones
// ------------------------------------------------------------

export function devolverMateriales(instructorId: string, lineas: MovimientoDetalle[]): void {
  const lineasValidas = lineas.filter((l) => l.cantidad > 0);
  if (lineasValidas.length === 0) throw new Error('Selecciona al menos un material para devolver.');

  const ahora = new Date().toISOString();
  let asignaciones = leer.asignaciones();
  const nuevas: Asignacion[] = [];
  let items = leer.items();

  for (const { itemId, cantidad } of lineasValidas) {
    const activas = asignaciones
      .filter((a) => a.instructorId === instructorId && a.itemId === itemId && a.fechaDevolucion === null)
      .sort((a, b) => a.fechaAsignacion.localeCompare(b.fechaAsignacion));
    const asignado = activas.reduce((acc, a) => acc + a.cantidad, 0);
    const item = items.find((i) => i.id === itemId);
    if (!Number.isInteger(cantidad) || cantidad > asignado) {
      throw new Error(`No puedes devolver ${cantidad} unidad(es) de ${item?.nombre ?? 'este material'}; tienes ${asignado}.`);
    }

    // Consumir asignaciones en orden FIFO; las parciales se dividen para conservar la trazabilidad.
    let pendiente = cantidad;
    for (const a of activas) {
      if (pendiente === 0) break;
      if (a.cantidad <= pendiente) {
        pendiente -= a.cantidad;
        asignaciones = asignaciones.map((x) => (x.id === a.id ? { ...x, fechaDevolucion: ahora } : x));
      } else {
        asignaciones = asignaciones.map((x) => (x.id === a.id ? { ...x, cantidad: x.cantidad - pendiente } : x));
        nuevas.push({ ...a, id: generarId(), cantidad: pendiente, fechaDevolucion: ahora });
        pendiente = 0;
      }
    }

    items = items.map((i) => {
      if (i.id !== itemId) return i;
      const actualizado = { ...i, cantidadDisponible: Math.min(i.cantidadTotal, i.cantidadDisponible + cantidad), actualizadoEn: ahora };
      return { ...actualizado, estado: estadoSegunDisponibilidad(actualizado) };
    });
  }

  const movimiento = nuevoMovimiento({
    tipo: 'devolucion',
    usuarioId: instructorId,
    instructorId,
    detalle: lineasValidas,
    observacion: 'Devolución de materiales a bodega',
  });

  writeMany([
    [STORAGE_KEYS.asignaciones, [...asignaciones, ...nuevas]],
    [STORAGE_KEYS.items, items],
    [STORAGE_KEYS.movimientos, [...leer.movimientos(), movimiento]],
  ]);
}

// ------------------------------------------------------------
// Evidencias
// ------------------------------------------------------------

export interface NuevaEvidenciaInput {
  instructorId: string;
  itemId: string;
  tipo: EvidenciaTipo;
  descripcion: string;
  archivo: string;
  nombreArchivo: string;
}

export function registrarEvidencia(input: NuevaEvidenciaInput): Evidencia {
  if (!input.itemId) throw new Error('Selecciona el material al que corresponde la evidencia.');
  if (!input.archivo) throw new Error('Adjunta o toma una foto como evidencia.');
  if (!input.descripcion.trim()) throw new Error('Escribe un mensaje describiendo la evidencia.');

  const evidencia: Evidencia = {
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
  writeMany([
    [STORAGE_KEYS.evidencias, [...leer.evidencias(), evidencia]],
    [STORAGE_KEYS.movimientos, [...leer.movimientos(), movimiento]],
  ]);
  return evidencia;
}

// ------------------------------------------------------------
// Configuración de contratos
// ------------------------------------------------------------

export interface ContratoEdicion {
  numeroContrato: string;
  proveedor: string;
  fechaFin: string;
}

export interface ItemEdicion {
  id: string;
  nombre: string;
  valorUnitario: number;
  cantidadTotal: number;
  ubicacion: string;
}

/** Devuelve la lista de cambios registrados (vacía si no hubo cambios). */
export function actualizarContrato(
  contratoId: string,
  datos: ContratoEdicion,
  ediciones: ItemEdicion[],
  usuarioId: string,
): string[] {
  const contratos = leer.contratos();
  const contrato = contratos.find((c) => c.id === contratoId);
  if (!contrato) throw new Error('El contrato ya no existe.');
  if (!datos.numeroContrato.trim() || !datos.proveedor.trim()) {
    throw new Error('El número de contrato y el proveedor son obligatorios.');
  }

  const ahora = new Date().toISOString();
  const cambios: string[] = [];
  const registrar = (prefijo: string, campo: string, antes: string | number, despues: string | number) => {
    if (antes !== despues) cambios.push(`${prefijo}${campo}: ${antes} → ${despues}`);
  };

  const items = leer.items();
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
      throw new Error(`${item.codigo}: la cantidad no puede ser menor a las ${enUso} unidad(es) en uso.`);
    }

    const p = `[${item.codigo}] `;
    registrar(p, 'Nombre', item.nombre, nombre);
    registrar(p, 'Cantidad', item.cantidadTotal, ed.cantidadTotal);
    registrar(p, 'Valor unitario', formatCOP(item.valorUnitario), formatCOP(ed.valorUnitario));
    registrar(p, 'Ubicación', item.ubicacion, ed.ubicacion.trim());

    const actualizado: ItemContrato = {
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

  const presupuesto = itemsActualizados
    .filter((i) => i.contratoId === contratoId)
    .reduce((acc, i) => acc + i.valorUnitario * i.cantidadTotal, 0);

  registrar('', 'N° contrato', contrato.numeroContrato, datos.numeroContrato.trim());
  registrar('', 'Proveedor', contrato.proveedor, datos.proveedor.trim());
  registrar('', 'Fecha fin', contrato.fechaFin.slice(0, 10), datos.fechaFin);
  registrar('', 'Presupuesto', formatCOP(contrato.presupuesto), formatCOP(presupuesto));

  if (cambios.length === 0) return cambios;

  const contratoActualizado: Contrato = {
    ...contrato,
    numeroContrato: datos.numeroContrato.trim(),
    proveedor: datos.proveedor.trim(),
    fechaFin: datos.fechaFin === contrato.fechaFin.slice(0, 10) ? contrato.fechaFin : new Date(datos.fechaFin).toISOString(),
    presupuesto,
    actualizadoEn: ahora,
  };

  const movimiento = nuevoMovimiento({
    tipo: 'contrato_actualizado',
    usuarioId,
    contratoId,
    cambios,
    observacion: `Contrato ${contrato.nombre} actualizado`,
  });

  writeMany([
    [STORAGE_KEYS.items, itemsActualizados],
    [STORAGE_KEYS.contratos, contratos.map((c) => (c.id === contratoId ? contratoActualizado : c))],
    [STORAGE_KEYS.movimientos, [...leer.movimientos(), movimiento]],
  ]);
  return cambios;
}
