// ============================================================
// Modelo de datos del Sistema de Inventario SENA
// Toda la persistencia vive en localStorage; las fechas se
// guardan como strings ISO 8601 para que sean serializables.
//
// Este archivo no contiene código ejecutable: documenta la forma
// de cada objeto con JSDoc. VS Code lo usa para autocompletar.
// ============================================================

/** @typedef {string} ISODateString */
/** Imagen codificada como data URL (ej. "data:image/jpeg;base64,..."). @typedef {string} DataURL */

// ------------------------------------------------------------
// Usuarios y sesión
// ------------------------------------------------------------

/** @typedef {'instructor' | 'administrativo'} UserRole */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} nombre
 * @property {string} correo
 * @property {string} passwordHash Hash SHA-256 de la contraseña (nunca texto plano, aunque sea prototipo).
 * @property {UserRole} rol
 * @property {boolean} activo
 * @property {ISODateString} creadoEn
 */

/** Usuario expuesto a la UI, sin datos sensibles (User sin passwordHash). @typedef {Omit<User, 'passwordHash'>} PublicUser */

/**
 * @typedef {Object} Session
 * @property {string} userId
 * @property {UserRole} rol
 * @property {ISODateString} iniciadaEn
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {UserRole} rol
 * @property {string} correo
 * @property {string} password
 */

// ------------------------------------------------------------
// Contratos e ítems de inventario
// ------------------------------------------------------------

/** @typedef {'electronica' | 'mobiliario' | 'herramientas'} ContratoCategoria */

/**
 * @typedef {Object} Contrato
 * @property {string} id
 * @property {ContratoCategoria} categoria
 * @property {string} nombre "Electrónica", "Mobiliario", "Herramientas"
 * @property {string} numeroContrato
 * @property {string} proveedor
 * @property {number} presupuesto Presupuesto total en COP (entero, sin decimales).
 * @property {ISODateString} fechaInicio
 * @property {ISODateString} fechaFin
 * @property {ISODateString} actualizadoEn
 */

/** @typedef {'tecnologia' | 'diseno' | 'industria' | 'construccion' | 'administracion'} Coordinacion */

/** @typedef {'disponible' | 'en_uso' | 'mantenimiento' | 'dado_de_baja'} ItemEstado */

/**
 * @typedef {Object} ItemContrato
 * @property {string} id
 * @property {string} contratoId
 * @property {string} nombre ej. "Laptop HP ProBook"
 * @property {string} codigo Código único de inventario, ej. "ELEC-001".
 * @property {string} [descripcion]
 * @property {number} valorUnitario Valor unitario en COP.
 * @property {number} cantidadTotal
 * @property {number} cantidadDisponible Siempre 0 <= cantidadDisponible <= cantidadTotal.
 * @property {string} ubicacion Ubicación física por defecto (bodega / ambiente).
 * @property {Coordinacion} [coordinacion] Coordinación académica que usa el ítem (para reportes).
 * @property {ItemEstado} estado
 * @property {ISODateString} actualizadoEn
 */

// ------------------------------------------------------------
// Asignaciones (base de la trazabilidad y de "Mis Materiales")
// ------------------------------------------------------------

/** @typedef {'verde' | 'amarillo' | 'rojo'} SemaforoNivel */

/**
 * @typedef {Object} Asignacion
 * @property {string} id
 * @property {string} itemId
 * @property {string} instructorId
 * @property {string} solicitudId
 * @property {number} cantidad
 * @property {string} ubicacionActual
 * @property {ISODateString} fechaAsignacion
 * @property {ISODateString | null} fechaDevolucion null mientras el material siga en uso.
 */

/**
 * Fila derivada (no persistida) para la tabla de trazabilidad.
 * @typedef {Object} TrazabilidadRow
 * @property {string} asignacionId
 * @property {string} material
 * @property {string} codigo
 * @property {string} ubicacionActual
 * @property {string} instructorAsignado
 * @property {number} diasEnUso
 * @property {SemaforoNivel} semaforo
 */

// ------------------------------------------------------------
// Movimientos (historial / auditoría)
// ------------------------------------------------------------

/**
 * @typedef {'solicitud_creada' | 'solicitud_aprobada' | 'solicitud_rechazada' | 'asignacion'
 *   | 'devolucion' | 'ajuste_inventario' | 'contrato_actualizado' | 'evidencia_cargada'} MovimientoTipo
 */

/**
 * @typedef {Object} MovimientoDetalle
 * @property {string} itemId
 * @property {number} cantidad
 */

/**
 * @typedef {Object} Movimiento
 * @property {string} id
 * @property {MovimientoTipo} tipo
 * @property {string} usuarioId Usuario que ejecutó la acción.
 * @property {string} [instructorId] Instructor afectado (si aplica).
 * @property {string} [itemId]
 * @property {string} [contratoId]
 * @property {string} [solicitudId]
 * @property {number} [cantidad]
 * @property {string} [ubicacionOrigen]
 * @property {string} [ubicacionDestino]
 * @property {string} [observacion]
 * @property {MovimientoDetalle[]} [detalle] Materiales involucrados cuando un movimiento agrupa varios ítems (salida/entrada).
 * @property {string[]} [cambios] Cambios legibles de configuración, ej. "Cantidad: 10 → 15".
 * @property {ISODateString} fecha
 */

// ------------------------------------------------------------
// Solicitudes de materiales
// ------------------------------------------------------------

/** @typedef {'pendiente' | 'aprobada' | 'rechazada' | 'cancelada'} SolicitudEstado */

/**
 * @typedef {Object} SolicitudItem
 * @property {string} itemId
 * @property {number} cantidad
 * @property {number} valorUnitario Snapshot del valor unitario al momento de solicitar.
 */

/** @typedef {'tecnologo' | 'tecnico'} TipoFormacion */

/**
 * Datos del formato oficial SENA diligenciado por el instructor.
 * @typedef {Object} SolicitudFormulario
 * @property {string} nombre
 * @property {string} apellido
 * @property {string} programa
 * @property {TipoFormacion} tipoFormacion
 */

/**
 * @typedef {Object} ArchivoAdjunto
 * @property {string} nombre
 * @property {string} mimeType
 * @property {number} tamano
 * @property {DataURL} data
 */

/**
 * @typedef {Object} Solicitud
 * @property {string} id
 * @property {string} numero Consecutivo visible, ej. "SOL-1727640000000".
 * @property {string} instructorId
 * @property {SolicitudItem[]} items
 * @property {number} valorTotal Suma de cantidad * valorUnitario. Debe ser <= PRESUPUESTO_MAX_SOLICITUD.
 * @property {SolicitudFormulario} formulario
 * @property {ArchivoAdjunto} formatoPdf Formato PDF firmado (obligatorio).
 * @property {string} [justificacion]
 * @property {DataURL} [fotoWebcam] Foto opcional capturada con la webcam.
 * @property {SolicitudEstado} estado
 * @property {ISODateString} creadaEn
 * @property {ISODateString | null} resueltaEn
 * @property {string | null} resueltaPor id del administrativo
 * @property {string} [motivoRechazo]
 */

// ------------------------------------------------------------
// Evidencias
// ------------------------------------------------------------

/** @typedef {'uso' | 'entrega' | 'devolucion' | 'dano' | 'documental'} EvidenciaTipo */

/**
 * @typedef {Object} Evidencia
 * @property {string} id
 * @property {string} itemId
 * @property {string} instructorId
 * @property {string} [asignacionId]
 * @property {EvidenciaTipo} tipo
 * @property {string} descripcion
 * @property {DataURL} archivo
 * @property {string} nombreArchivo
 * @property {string} mimeType
 * @property {ISODateString} cargadaEn
 */

// ------------------------------------------------------------
// Utilidades de UI / validación
// ------------------------------------------------------------

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {Record<string, string>} errors
 */

/**
 * @typedef {Object} InventarioResumen
 * @property {number} totalMateriales
 * @property {number} enUso
 * @property {number} disponibles
 */

export {};
