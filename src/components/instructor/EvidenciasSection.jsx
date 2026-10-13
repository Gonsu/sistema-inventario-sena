// Importar herramientas básicas de React
import { useMemo } from 'react';

// Importar los datos del inventario (se actualizan solos cuando cambian)
import { useCatalogo, useEvidencias } from '../../hooks/useInventarioData';

// Importar funciones de formato (pesos, fechas) y búsqueda
import { formatFecha } from '../../utils/format';

// Importar los textos que se muestran para cada valor
import { EVIDENCIA_TIPO_LABEL } from '../../utils/labels';

// Importar componentes visuales reutilizables
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import SectionCard from '../ui/SectionCard';

// Sección con las evidencias fotográficas que ha subido el instructor.
// onNueva abre la ventana para cargar una nueva evidencia.
function EvidenciasSection({ instructorId, onNueva }) {
  // Datos del inventario
  const evidencias = useEvidencias();
  const { itemPorId } = useCatalogo();
  // Solo las evidencias de este instructor, de la más reciente a la más antigua
  const propias = useMemo(
    () =>
      evidencias
        .filter((e) => e.instructorId === instructorId)
        .sort((a, b) => b.cargadaEn.localeCompare(a.cargadaEn)),
    [evidencias, instructorId],
  );

  // Todo componente de React debe retornar un solo contenedor padre
  return (
    <SectionCard
      titulo="Evidencias"
      acciones={
        <button className="btn-primary" onClick={onNueva}>
          + Cargar Nueva Evidencia
        </button>
      }
    >
      {propias.length === 0 ? (
        <EmptyState mensaje="Aún no has cargado evidencias." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Galería: una tarjeta por evidencia */}
          {propias.map((e) => (
            <article
              key={e.id}
              className="overflow-hidden rounded-input border border-sena-card-border bg-white"
            >
              <img
                src={e.archivo}
                alt={`Evidencia de ${itemPorId.get(e.itemId)?.nombre ?? 'material'}`}
                className="h-32 w-full object-cover"
              />
              <div className="space-y-1 p-3">
                <p className="font-title text-sm font-bold text-sena-header">
                  {itemPorId.get(e.itemId)?.nombre ?? 'Material eliminado'}
                </p>
                <Badge>{EVIDENCIA_TIPO_LABEL[e.tipo]}</Badge>
                <p className="font-data text-xs text-gray-500">{formatFecha(e.cargadaEn)}</p>
                <p className="line-clamp-2 font-data text-xs text-gray-700">{e.descripcion}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

export default EvidenciasSection;
