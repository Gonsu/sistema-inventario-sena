import type { ContratoCategoria, SemaforoNivel } from '../types';

/** Presupuesto máximo por solicitud de instructor (COP). */
export const PRESUPUESTO_MAX_SOLICITUD = 3_000_000;

/** Presupuestos iniciales de los contratos (COP). */
export const PRESUPUESTO_CONTRATOS: Record<ContratoCategoria, number> = {
  electronica: 40_400_000,
  mobiliario: 21_110_000,
  herramientas: 11_940_000,
};

/** Intervalo de sincronización con localStorage (ms). */
export const POLLING_INTERVAL_MS = 2000;

/** Claves de localStorage (prefijadas y versionadas para migraciones). */
export const STORAGE_KEYS = {
  users: 'sena_inv_v1_users',
  session: 'sena_inv_v1_session', // sessionStorage (por pestaña)
  contratos: 'sena_inv_v1_contratos',
  items: 'sena_inv_v1_items',
  asignaciones: 'sena_inv_v1_asignaciones',
  movimientos: 'sena_inv_v1_movimientos',
  solicitudes: 'sena_inv_v1_solicitudes',
  evidencias: 'sena_inv_v1_evidencias',
} as const;

/** Umbrales del semáforo de "Días en Uso" (ajustables). */
export const SEMAFORO_UMBRALES = {
  verdeMax: 24, // < 25 días
  amarilloMax: 44, // 25–44 días; >= 45 = rojo
} as const;

export function nivelSemaforo(dias: number): SemaforoNivel {
  if (dias <= SEMAFORO_UMBRALES.verdeMax) return 'verde';
  if (dias <= SEMAFORO_UMBRALES.amarilloMax) return 'amarillo';
  return 'rojo';
}
