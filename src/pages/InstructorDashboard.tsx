import { useMemo, useState } from 'react';
import { useUsuarioActual } from '../context/AuthContext';
import { useCatalogo, useMaterialesAsignados, useSolicitudes } from '../hooks/useInventarioData';
import { DevolucionModal } from '../components/instructor/DevolucionModal';
import { EvidenciaModal } from '../components/instructor/EvidenciaModal';
import { EvidenciasSection } from '../components/instructor/EvidenciasSection';
import { HistorialMovimientosInstructor } from '../components/instructor/HistorialMovimientosInstructor';
import { MisMaterialesTable } from '../components/instructor/MisMaterialesTable';
import { SolicitudMaterialesModal } from '../components/instructor/SolicitudMaterialesModal';
import { MetricCard, SectionCard } from '../components/ui/Primitives';
import { useToast } from '../components/ui/Toast';

type ModalAbierto = 'devolucion' | 'evidencia' | 'solicitud' | null;

export default function InstructorDashboard() {
  const usuario = useUsuarioActual();
  const materiales = useMaterialesAsignados(usuario.id);
  const solicitudes = useSolicitudes();
  const { items } = useCatalogo();
  const [modal, setModal] = useState<ModalAbierto>(null);
  const { mostrar, toast } = useToast();
  const cerrar = () => setModal(null);

  const totalUnidades = materiales.reduce((acc, m) => acc + m.cantidad, 0);
  const pendientes = solicitudes.filter((s) => s.instructorId === usuario.id && s.estado === 'pendiente').length;

  // Las evidencias se asocian a los materiales asignados; si no hay, al catálogo completo.
  const materialesEvidencia = useMemo(
    () => (materiales.length > 0 ? materiales.map((m) => ({ id: m.itemId, nombre: m.nombre, codigo: m.codigo })) : items),
    [materiales, items],
  );

  return (
    <>
      <div>
        <h1 className="text-2xl">Panel de Instructor</h1>
        <p className="font-data text-sm text-sena-header/80">Bienvenido(a), {usuario.nombre}</p>
      </div>

      <MisMaterialesTable materiales={materiales} />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard titulo="Devolver Material">
          <p className="mb-4 font-data text-sm text-gray-700">
            Registra la entrega a bodega de los materiales que ya no necesitas. El inventario se actualiza al instante para la administración.
          </p>
          <button className="btn-primary" onClick={() => setModal('devolucion')} disabled={materiales.length === 0}>
            Iniciar Devolución
          </button>
        </SectionCard>

        <SectionCard titulo="Historial de Movimientos">
          <HistorialMovimientosInstructor instructorId={usuario.id} />
        </SectionCard>
      </div>

      <EvidenciasSection instructorId={usuario.id} onNueva={() => setModal('evidencia')} />

      <div className="grid gap-6 sm:grid-cols-3">
        <MetricCard etiqueta="Total materiales asignados" valor={totalUnidades}>
          <p className="font-data text-xs text-gray-600">{materiales.length} tipo(s) de material</p>
        </MetricCard>
        <MetricCard etiqueta="Solicitudes pendientes" valor={pendientes}>
          <p className="font-data text-xs text-gray-600">En revisión por la administración</p>
        </MetricCard>
        <MetricCard etiqueta="Nueva Solicitud">
          <p className="font-data text-sm text-gray-700">Solicita materiales de los contratos vigentes (máx. $3.000.000 COP).</p>
          <button className="btn-primary" onClick={() => setModal('solicitud')}>+ Nueva Solicitud</button>
        </MetricCard>
      </div>

      <DevolucionModal abierto={modal === 'devolucion'} onCerrar={cerrar} instructorId={usuario.id} materiales={materiales} onExito={mostrar} />
      <EvidenciaModal abierto={modal === 'evidencia'} onCerrar={cerrar} instructorId={usuario.id} materiales={materialesEvidencia} onExito={mostrar} />
      <SolicitudMaterialesModal abierto={modal === 'solicitud'} onCerrar={cerrar} usuario={usuario} onExito={mostrar} />
      {toast}
    </>
  );
}
