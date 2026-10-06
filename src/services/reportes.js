// ============================================================
// Selectores puros para la vista de Reportes. No escriben en
// localStorage: reciben los datos sincronizados y los transforman.
// ============================================================

import { coordinacionDeItem } from '../data/seed';
import { nivelSemaforo } from '../utils/constants';
import { coincide } from '../utils/format';

const DIA_MS = 24 * 60 * 60 * 1000;

function categoriaDe(item, contratoPorId) {
  return contratoPorId.get(item.contratoId)?.categoria;
}

// ------------------------------------------------------------
// Costos
// ------------------------------------------------------------

export function filasCostos(items, contratoPorId, f) {
  return items.flatMap((item) => {
    const categoria = categoriaDe(item, contratoPorId);
    const coordinacion = coordinacionDeItem(item);
    if (!categoria) return [];
    if (f.contrato && categoria !== f.contrato) return [];
    if (f.coordinacion && coordinacion !== f.coordinacion) return [];
    if (!coincide(f.busqueda, item.nombre, item.codigo)) return [];
    return [
      {
        id: item.id,
        item: item.nombre,
        codigo: item.codigo,
        categoria,
        coordinacion,
        cantidad: item.cantidadTotal,
        costoUnidad: item.valorUnitario,
        costoMayor: item.valorUnitario * item.cantidadTotal,
      },
    ];
  });
}

// ------------------------------------------------------------
// Inversión mensual (solicitudes aceptadas por mes de aceptación)
// ------------------------------------------------------------

export const MESES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export function inversionMensual(solicitudes, itemPorId, contratoPorId, anio) {
  const meses = MESES.map((mes) => ({
    mes,
    electronica: 0,
    mobiliario: 0,
    herramientas: 0,
  }));
  for (const s of solicitudes) {
    if (s.estado !== 'aprobada' || !s.resueltaEn) continue;
    const fecha = new Date(s.resueltaEn);
    if (fecha.getFullYear() !== anio) continue;
    for (const l of s.items) {
      const item = itemPorId.get(l.itemId);
      const categoria = item && categoriaDe(item, contratoPorId);
      if (categoria) meses[fecha.getMonth()][categoria] += l.cantidad * l.valorUnitario;
    }
  }
  return meses;
}

/** Ejecutado en el año ÷ meses transcurridos × 12. */
export function proyeccionAnual(mensual, hoy) {
  const ejecutado = mensual.reduce(
    (acc, m) => acc + m.electronica + m.mobiliario + m.herramientas,
    0,
  );
  const mesesTranscurridos = hoy.getMonth() + 1;
  return {
    ejecutado,
    proyeccion: Math.round((ejecutado / mesesTranscurridos) * 12),
  };
}

// ------------------------------------------------------------
// Entregas (líneas de solicitudes aceptadas o pendientes)
// ------------------------------------------------------------

export function filasEntregas(solicitudes, itemPorId, contratoPorId) {
  return solicitudes
    .filter((s) => s.estado === 'aprobada' || s.estado === 'pendiente')
    .flatMap((s) =>
      s.items.flatMap((l) => {
        const item = itemPorId.get(l.itemId);
        const categoria = item && categoriaDe(item, contratoPorId);
        if (!item || !categoria) return [];
        return [
          {
            id: `${s.id}-${l.itemId}`,
            codigo: item.codigo,
            nombre: item.nombre,
            categoria,
            coordinacion: coordinacionDeItem(item),
            cantidad: l.cantidad,
            estado: s.estado === 'aprobada' ? 'entregado' : 'pendiente',
            fechaEntrega: s.estado === 'aprobada' ? s.resueltaEn : null,
            instructor: `${s.formulario.nombre} ${s.formulario.apellido}`,
            solicitud: s.numero,
          },
        ];
      }),
    )
    .sort((a, b) => (b.fechaEntrega ?? '9').localeCompare(a.fechaEntrega ?? '9'));
}

export function filtrarEntregas(filas, f) {
  return filas.filter(
    (r) =>
      (!f.contrato || r.categoria === f.contrato) &&
      (!f.coordinacion || r.coordinacion === f.coordinacion) &&
      (!f.estado || r.estado === f.estado),
  );
}

// ------------------------------------------------------------
// Trazabilidad (asignaciones activas)
// ------------------------------------------------------------

export function filasTrazabilidad(asignaciones, itemPorId, usuarios, f, hoy = new Date()) {
  return asignaciones
    .filter((a) => a.fechaDevolucion === null)
    .map((a) => {
      const item = itemPorId.get(a.itemId);
      const diasEnUso = Math.max(
        0,
        Math.floor((hoy.getTime() - new Date(a.fechaAsignacion).getTime()) / DIA_MS),
      );
      return {
        asignacionId: a.id,
        material: item ? `${item.nombre} (×${a.cantidad})` : 'Material eliminado',
        codigo: item?.codigo ?? '—',
        ubicacionActual: a.ubicacionActual,
        instructorAsignado: usuarios.find((u) => u.id === a.instructorId)?.nombre ?? 'Desconocido',
        diasEnUso,
        semaforo: nivelSemaforo(diasEnUso),
      };
    })
    .filter(
      (r) =>
        coincide(f.material, r.material, r.codigo) &&
        coincide(f.ubicacion, r.ubicacionActual) &&
        coincide(f.instructor, r.instructorAsignado) &&
        (!f.semaforo || r.semaforo === f.semaforo),
    )
    .sort((a, b) => b.diasEnUso - a.diasEnUso);
}

export function resumenInventario(items) {
  return items.reduce(
    (acc, i) => ({
      totalMateriales: acc.totalMateriales + i.cantidadTotal,
      disponibles: acc.disponibles + i.cantidadDisponible,
      enUso: acc.enUso + (i.cantidadTotal - i.cantidadDisponible),
    }),
    { totalMateriales: 0, enUso: 0, disponibles: 0 },
  );
}

// ------------------------------------------------------------
// Distribución por contrato (gráfica de torta)
// ------------------------------------------------------------

export function distribucionContrato(items, contratoId) {
  const propios = items.filter((i) => i.contratoId === contratoId);
  const total = propios.reduce((acc, i) => acc + i.valorUnitario * i.cantidadTotal, 0);
  const porciones = propios.map((i) => {
    const valor = i.valorUnitario * i.cantidadTotal;
    return {
      itemId: i.id,
      nombre: i.nombre,
      valor,
      porcentaje: total ? (valor / total) * 100 : 0,
    };
  });
  return { porciones, total };
}
