// ============================================================
// Tipos principales del Sistema de Inventario SENA
// Toda la persistencia vive en localStorage; las fechas se
// guardan como strings ISO 8601 para que sean serializables.
// ============================================================

export type ISODateString = string;
/** Imagen codificada como data URL (ej. "data:image/jpeg;base64,..."). */
export type DataURL = string;

// ------------------------------------------------------------
// Usuarios y sesión
// ------------------------------------------------------------

export type UserRole = 'instructor' | 'administrativo';

export interface User {
  id: string;
  nombre: string;
  correo: string;
  /** Hash SHA-256 de la contraseña (nunca texto plano, aunque sea prototipo). */
  passwordHash: string;
  rol: UserRole;
  activo: boolean;
  creadoEn: ISODateString;
}

/** Usuario expuesto a la UI, sin datos sensibles. */
export type PublicUser = Omit<User, 'passwordHash'>;

export interface Session {
  userId: string;
  rol: UserRole;
  iniciadaEn: ISODateString;
}

export interface LoginCredentials {
  rol: UserRole;
  correo: string;
  password: string;
}

// ------------------------------------------------------------
// Contratos e ítems de inventario
// ------------------------------------------------------------

export type ContratoCategoria = 'electronica' | 'mobiliario' | 'herramientas';

export interface Contrato {
  id: string;
  categoria: ContratoCategoria;
  nombre: string; // "Electrónica", "Mobiliario", "Herramientas"
  numeroContrato: string;
  proveedor: string;
  /** Presupuesto total en COP (entero, sin decimales). */
  presupuesto: number;
  fechaInicio: ISODateString;
  fechaFin: ISODateString;
  actualizadoEn: ISODateString;
}

export type Coordinacion = 'tecnologia' | 'diseno' | 'industria' | 'construccion' | 'administracion';

export type ItemEstado = 'disponible' | 'en_uso' | 'mantenimiento' | 'dado_de_baja';

export interface ItemContrato {
  id: string;
  contratoId: string;
  nombre: string; // ej. "Laptop HP ProBook"
  /** Código único de inventario, ej. "ELEC-001". */
  codigo: string;
  descripcion?: string;
  /** Valor unitario en COP. */
  valorUnitario: number;
  cantidadTotal: number;
  /** Siempre 0 <= cantidadDisponible <= cantidadTotal. */
  cantidadDisponible: number;
  /** Ubicación física por defecto (bodega / ambiente). */
  ubicacion: string;
  /** Coordinación académica que usa el ítem (para reportes). */
  coordinacion?: Coordinacion;
  estado: ItemEstado;
  actualizadoEn: ISODateString;
}

// ------------------------------------------------------------
// Asignaciones (base de la trazabilidad y de "Mis Materiales")
// ------------------------------------------------------------

export type SemaforoNivel = 'verde' | 'amarillo' | 'rojo';

export interface Asignacion {
  id: string;
  itemId: string;
  instructorId: string;
  solicitudId: string;
  cantidad: number;
  ubicacionActual: string;
  fechaAsignacion: ISODateString;
  /** null mientras el material siga en uso. */
  fechaDevolucion: ISODateString | null;
}

/** Fila derivada (no persistida) para la tabla de trazabilidad. */
export interface TrazabilidadRow {
  asignacionId: string;
  material: string;
  codigo: string;
  ubicacionActual: string;
  instructorAsignado: string;
  diasEnUso: number;
  semaforo: SemaforoNivel;
}

// ------------------------------------------------------------
// Movimientos (historial / auditoría)
// ------------------------------------------------------------

export type MovimientoTipo =
  | 'solicitud_creada'
  | 'solicitud_aprobada'
  | 'solicitud_rechazada'
  | 'asignacion'
  | 'devolucion'
  | 'ajuste_inventario'
  | 'contrato_actualizado'
  | 'evidencia_cargada';

export interface Movimiento {
  id: string;
  tipo: MovimientoTipo;
  /** Usuario que ejecutó la acción. */
  usuarioId: string;
  /** Instructor afectado (si aplica). */
  instructorId?: string;
  itemId?: string;
  contratoId?: string;
  solicitudId?: string;
  cantidad?: number;
  ubicacionOrigen?: string;
  ubicacionDestino?: string;
  observacion?: string;
  /** Materiales involucrados cuando un movimiento agrupa varios ítems (salida/entrada). */
  detalle?: MovimientoDetalle[];
  /** Cambios legibles de configuración, ej. "Cantidad: 10 → 15". */
  cambios?: string[];
  fecha: ISODateString;
}

export interface MovimientoDetalle {
  itemId: string;
  cantidad: number;
}

// ------------------------------------------------------------
// Solicitudes de materiales
// ------------------------------------------------------------

export type SolicitudEstado = 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';

export interface SolicitudItem {
  itemId: string;
  cantidad: number;
  /** Snapshot del valor unitario al momento de solicitar. */
  valorUnitario: number;
}

export type TipoFormacion = 'tecnologo' | 'tecnico';

/** Datos del formato oficial SENA diligenciado por el instructor. */
export interface SolicitudFormulario {
  nombre: string;
  apellido: string;
  programa: string;
  tipoFormacion: TipoFormacion;
}

export interface ArchivoAdjunto {
  nombre: string;
  mimeType: string;
  tamano: number;
  data: DataURL;
}

export interface Solicitud {
  id: string;
  /** Consecutivo visible, ej. "SOL-1727640000000". */
  numero: string;
  instructorId: string;
  items: SolicitudItem[];
  /** Suma de cantidad * valorUnitario. Debe ser <= PRESUPUESTO_MAX_SOLICITUD. */
  valorTotal: number;
  formulario: SolicitudFormulario;
  /** Formato PDF firmado (obligatorio). */
  formatoPdf: ArchivoAdjunto;
  justificacion?: string;
  /** Foto opcional capturada con la webcam. */
  fotoWebcam?: DataURL;
  estado: SolicitudEstado;
  creadaEn: ISODateString;
  resueltaEn: ISODateString | null;
  resueltaPor: string | null; // id del administrativo
  motivoRechazo?: string;
}

// ------------------------------------------------------------
// Evidencias
// ------------------------------------------------------------

export type EvidenciaTipo = 'uso' | 'entrega' | 'devolucion' | 'dano' | 'documental';

export interface Evidencia {
  id: string;
  itemId: string;
  instructorId: string;
  asignacionId?: string;
  tipo: EvidenciaTipo;
  descripcion: string;
  archivo: DataURL;
  nombreArchivo: string;
  mimeType: string;
  cargadaEn: ISODateString;
}

// ------------------------------------------------------------
// Utilidades de UI / validación
// ------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface InventarioResumen {
  totalMateriales: number;
  enUso: number;
  disponibles: number;
}
