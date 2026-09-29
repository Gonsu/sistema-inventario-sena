import { useMemo } from 'react';
import { useCatalogo, useEvidencias } from '../../hooks/useInventarioData';
import { formatFecha } from '../../utils/format';
import { EVIDENCIA_TIPO_LABEL } from '../../utils/labels';
import { Badge, EmptyState, SectionCard } from '../ui/Primitives';

export function EvidenciasSection({ instructorId, onNueva }: { instructorId: string; onNueva: () => void }) {
  const evidencias = useEvidencias();
  const { itemPorId } = useCatalogo();
  const propias = useMemo(
    () => evidencias.filter((e) => e.instructorId === instructorId).sort((a, b) => b.cargadaEn.localeCompare(a.cargadaEn)),
    [evidencias, instructorId],
  );

  return (
    <SectionCard titulo="Evidencias" acciones={<button className="btn-primary" onClick={onNueva}>+ Cargar Nueva Evidencia</button>}>
      {propias.length === 0 ? (
        <EmptyState mensaje="Aún no has cargado evidencias." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {propias.map((e) => (
            <article key={e.id} className="overflow-hidden rounded-input border border-sena-card-border bg-white">
              <img src={e.archivo} alt={`Evidencia de ${itemPorId.get(e.itemId)?.nombre ?? 'material'}`} className="h-32 w-full object-cover" />
              <div className="space-y-1 p-3">
                <p className="font-title text-sm font-bold text-sena-header">{itemPorId.get(e.itemId)?.nombre ?? 'Material eliminado'}</p>
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
