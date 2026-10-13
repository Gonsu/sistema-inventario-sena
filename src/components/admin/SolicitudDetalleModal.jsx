// Importar herramientas básicas de React
import { useEffect, useState } from 'react';

// Importar las funciones para exportar a PDF y Excel
import { exportarSolicitudPDF, exportarSolicitudXLSX } from '../../utils/exportar';

// Importar utilidades para manejar archivos e imágenes
import { descargarDataURL } from '../../utils/files';

// Importar funciones de formato (pesos, fechas) y búsqueda
import { formatCOP } from '../../utils/format';

// Importar los textos que se muestran para cada valor
import { ESTADO_SOLICITUD_LABEL, TIPO_FORMACION_LABEL } from '../../utils/labels';

// Importar componentes visuales reutilizables
import FormatoEncabezado from '../ui/FormatoEncabezado';
import Modal from '../ui/Modal';
import Alerta from '../ui/Alerta';

// Ventana con el detalle completo de una solicitud:
// datos del instructor, materiales pedidos, valor total y vista previa del PDF adjunto.
// También permite exportarla a PDF o Excel y aceptarla si está pendiente.
function SolicitudDetalleModal({ solicitud, itemPorId, onCerrar, onAceptar }) {
  // Estados: mensaje de error, si se está exportando y la dirección del PDF para la vista previa
  const [error, setError] = useState(null);
  const [exportando, setExportando] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  // Convertir el PDF guardado en un enlace temporal para poder mostrarlo:
  // Chrome no siempre muestra PDFs "data:" embebidos; un Blob URL es más confiable.
  const pdfData = solicitud?.formatoPdf.data;
  useEffect(() => {
    if (!pdfData) return;
    let url = null;
    let cancelado = false;
    void fetch(pdfData)
      .then((r) => r.blob())
      .then((blob) => {
        if (cancelado) return;
        url = URL.createObjectURL(blob);
        setPdfUrl(url);
      })
      .catch(() => setPdfUrl(null));
    return () => {
      cancelado = true;
      if (url) URL.revokeObjectURL(url);
      setPdfUrl(null);
    };
  }, [pdfData]);

  // Exporta la solicitud usando la función que se le pase (PDF o Excel)
  const exportar = async (fn) => {
    if (!solicitud) return;
    setError(null);
    setExportando(true);
    try {
      await fn(solicitud, itemPorId);
    } catch {
      setError('No fue posible generar el archivo.');
    } finally {
      setExportando(false);
    }
  };

  // Atajo para los datos del formulario
  const f = solicitud?.formulario;
  return (
    <Modal
      abierto={!!solicitud}
      titulo={`Solicitud ${solicitud?.numero ?? ''}`}
      onCerrar={onCerrar}
      ancho="xl"
      // Botones de la parte de abajo
      pie={
        solicitud && (
          <>
            <button
              className="btn-outline"
              disabled={exportando}
              onClick={() => void exportar(exportarSolicitudPDF)}
            >
              Exportar PDF
            </button>
            <button
              className="btn-outline"
              disabled={exportando}
              onClick={() => void exportar(exportarSolicitudXLSX)}
            >
              Exportar Excel
            </button>
            <button
              className="btn-outline"
              onClick={() =>
                descargarDataURL(solicitud.formatoPdf.data, solicitud.formatoPdf.nombre)
              }
            >
              Descargar formato adjunto
            </button>
            {onAceptar && solicitud.estado === 'pendiente' && (
              <button className="btn-primary" onClick={() => onAceptar(solicitud)}>
                Aceptar
              </button>
            )}
          </>
        )
      }
    >
      {solicitud && f && (
        <div className="space-y-4">
          {/* Encabezado oficial del formato */}
          <FormatoEncabezado numero={solicitud.numero} fecha={solicitud.creadaEn} />
          {/* Datos del instructor y de la formación */}
          <dl className="grid gap-3 rounded-input bg-white p-4 font-data text-sm sm:grid-cols-2">
            <div>
              <dt className="label">Nombre</dt>
              <dd>{f.nombre}</dd>
            </div>
            <div>
              <dt className="label">Apellido</dt>
              <dd>{f.apellido}</dd>
            </div>
            <div>
              <dt className="label">Programa</dt>
              <dd>{f.programa}</dd>
            </div>
            <div>
              <dt className="label">Tipo de formación</dt>
              <dd className="font-semibold text-sena-header">
                {TIPO_FORMACION_LABEL[f.tipoFormacion]}
              </dd>
            </div>
            <div>
              <dt className="label">Estado</dt>
              <dd>{ESTADO_SOLICITUD_LABEL[solicitud.estado]}</dd>
            </div>
          </dl>
          {/* Materiales solicitados con sus valores */}
          <table className="table-base">
            <thead>
              <tr>
                <th>Código</th>
                <th>Material</th>
                <th className="text-center">Cantidad</th>
                <th className="text-right">Valor unitario</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {solicitud.items.map((l) => {
                const item = itemPorId.get(l.itemId);
                return (
                  <tr key={l.itemId}>
                    <td>{item?.codigo ?? '—'}</td>
                    <td>{item?.nombre ?? 'Material eliminado'}</td>
                    <td className="text-center">{l.cantidad}</td>
                    <td className="text-right">{formatCOP(l.valorUnitario)}</td>
                    <td className="text-right">{formatCOP(l.valorUnitario * l.cantidad)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-white font-title font-bold text-sena-header">
                <td colSpan={4} className="px-3 py-2 text-right">
                  VALOR TOTAL
                </td>
                <td className="px-3 py-2 text-right">{formatCOP(solicitud.valorTotal)}</td>
              </tr>
            </tfoot>
          </table>
          <div>
            {/* Vista previa del PDF adjunto */}
            <p className="label">Formato adjunto</p>
            <object
              data={pdfUrl ?? undefined}
              type="application/pdf"
              className="h-80 w-full rounded-input border border-sena-card-border bg-white"
            >
              <p className="p-4 font-data text-sm">
                Vista previa no disponible. Usa “Descargar formato adjunto”.
              </p>
            </object>
          </div>
          {/* Error al exportar */}
          {error && <Alerta>{error}</Alerta>}
        </div>
      )}
    </Modal>
  );
}

export default SolicitudDetalleModal;
