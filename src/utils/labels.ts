import type { ContratoCategoria, Coordinacion, EvidenciaTipo, SolicitudEstado, TipoFormacion } from '../types';

export const EVIDENCIA_TIPO_LABEL: Record<EvidenciaTipo, string> = {
  uso: 'Uso en ambiente',
  entrega: 'Entrega',
  devolucion: 'Devolución',
  dano: 'Daño / novedad',
  documental: 'Documental',
};

export const TIPO_FORMACION_LABEL: Record<TipoFormacion, string> = {
  tecnologo: 'Tecnólogo',
  tecnico: 'Técnico',
};

export const ESTADO_SOLICITUD_LABEL: Record<SolicitudEstado, string> = {
  pendiente: 'Pendiente',
  aprobada: 'Aceptada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
};

export const COORDINACION_LABEL: Record<Coordinacion, string> = {
  tecnologia: 'Tecnología',
  diseno: 'Diseño',
  industria: 'Industria',
  construccion: 'Construcción',
  administracion: 'Administración',
};

export const CONTRATO_LABEL: Record<ContratoCategoria, string> = {
  electronica: 'Electrónica',
  mobiliario: 'Mobiliario',
  herramientas: 'Herramientas',
};

/** Color de identidad de cada contrato: badges y gráficas usan el mismo. */
export const CONTRATO_COLOR: Record<ContratoCategoria, { fondo: string; texto: string }> = {
  electronica: { fondo: '#014011', texto: '#FFFFFF' },
  mobiliario: { fondo: '#025918', texto: '#FFFFFF' },
  herramientas: { fondo: '#9FBFAA', texto: '#014011' },
};
