// ============================================================
// Constantes del sistema: valores fijos que se usan en varias partes.
// Si hay que cambiar un tope o un plazo, se cambia solo aquí.
// ============================================================

// Presupuesto máximo por solicitud de instructor (en pesos)
export const PRESUPUESTO_MAX_SOLICITUD = 3_000_000;

// Presupuestos iniciales de los contratos (en pesos)
export const PRESUPUESTO_CONTRATOS = {
  electronica: 40_400_000,
  mobiliario: 21_110_000,
  herramientas: 11_940_000,
};

// Cada cuánto se revisa el localStorage para ver cambios de otras pestañas (2 segundos)
export const POLLING_INTERVAL_MS = 2000;

// Nombres con los que se guarda cada lista en el localStorage
export const STORAGE_KEYS = {
  users: 'sena_inv_v1_users',
  session: 'sena_inv_v1_session', // sessionStorage (por pestaña)
  contratos: 'sena_inv_v1_contratos',
  items: 'sena_inv_v1_items',
  asignaciones: 'sena_inv_v1_asignaciones',
  movimientos: 'sena_inv_v1_movimientos',
  solicitudes: 'sena_inv_v1_solicitudes',
  evidencias: 'sena_inv_v1_evidencias',
};

// Límites del semáforo de "Días en Uso"
export const SEMAFORO_UMBRALES = {
  verdeMax: 24, // < 25 días
  amarilloMax: 44, // 25–44 días; >= 45 = rojo
};

// Devuelve el color del semáforo según los días en uso
export function nivelSemaforo(dias) {
  if (dias <= SEMAFORO_UMBRALES.verdeMax) return 'verde';
  if (dias <= SEMAFORO_UMBRALES.amarilloMax) return 'amarillo';
  return 'rojo';
}

// Pantalla a la que llega cada rol después de iniciar sesión
export const RUTA_INICIO = {
  instructor: '/dashboard/instructor',
  administrativo: '/dashboard/administrativos',
};
