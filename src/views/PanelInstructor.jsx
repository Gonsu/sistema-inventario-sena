// Importar herramientas básicas de React
import { useMemo, useState } from 'react';

// Importar el usuario en sesión
import { useUsuarioActual } from '../context/AuthContext';

// Importar los datos del inventario (se actualizan solos cuando cambian)
import { useCatalogo, useMaterialesAsignados, useSolicitudes } from '../hooks/useInventarioData';

// Importar los componentes propios del instructor
import DevolucionModal from '../components/instructor/DevolucionModal';
import EvidenciaModal from '../components/instructor/EvidenciaModal';
import EvidenciasSection from '../components/instructor/EvidenciasSection';
import HistorialMovimientosInstructor from '../components/instructor/HistorialMovimientosInstructor';
import MisMaterialesTable from '../components/instructor/MisMaterialesTable';
import SolicitudMaterialesModal from '../components/instructor/SolicitudMaterialesModal';

// Importar componentes visuales reutilizables
import MetricCard from '../components/ui/MetricCard';
import SectionCard from '../components/ui/SectionCard';

// Importar el aviso flotante de confirmación
import { useToast } from '../hooks/useToast';

// Pantalla principal del instructor.
// Aquí ve sus materiales, puede devolverlos, subir evidencias,
// revisar su historial y hacer nuevas solicitudes.
function PanelInstructor() {
  // Datos que necesita la pantalla
  const usuario = useUsuarioActual();
  const materiales = useMaterialesAsignados(usuario.id);
  const solicitudes = useSolicitudes();
  const { items } = useCatalogo();
  // Guarda qué ventana emergente está abierta: 'devolucion', 'evidencia', 'solicitud' o null
  const [modal, setModal] = useState(null);
  // mostrar('texto') enseña un aviso verde en la esquina
  const { mostrar, toast } = useToast();
  // Cierra cualquier ventana emergente
  const cerrar = () => setModal(null);

  // Cálculos para las tarjetas de indicadores
  const totalUnidades = materiales.reduce((acc, m) => acc + m.cantidad, 0);
  const pendientes = solicitudes.filter(
    (s) => s.instructorId === usuario.id && s.estado === 'pendiente',
  ).length;

  // Las evidencias se asocian a los materiales asignados; si no hay, al catálogo completo.
  const materialesEvidencia = useMemo(
    () =>
      materiales.length > 0
        ? materiales.map((m) => ({
            id: m.itemId,
            nombre: m.nombre,
            codigo: m.codigo,
          }))
        : items,
    [materiales, items],
  );

  // Todo componente de React debe retornar un solo contenedor padre
  return (
    <>
      <div>
        {/* Saludo */}
        <h1 className="text-2xl">Panel de Instructor</h1>
        <p className="font-data text-sm text-sena-header/80">Bienvenido(a), {usuario.nombre}</p>
      </div>

      {/* Tabla con los materiales que tiene asignados el instructor */}
      <MisMaterialesTable materiales={materiales} />

      {/* Devolución de material e historial, uno al lado del otro */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard titulo="Devolver Material">
          <p className="mb-4 font-data text-sm text-gray-700">
            Registra la entrega a bodega de los materiales que ya no necesitas. El inventario se
            actualiza al instante para la administración.
          </p>
          <button
            className="btn-primary"
            onClick={() => setModal('devolucion')}
            disabled={materiales.length === 0}
          >
            Iniciar Devolución
          </button>
        </SectionCard>

        <SectionCard titulo="Historial de Movimientos">
          <HistorialMovimientosInstructor instructorId={usuario.id} />
        </SectionCard>
      </div>

      {/* Evidencias fotográficas */}
      <EvidenciasSection instructorId={usuario.id} onNueva={() => setModal('evidencia')} />

      {/* Tarjetas de indicadores y botón de nueva solicitud */}
      <div className="grid gap-6 sm:grid-cols-3">
        <MetricCard etiqueta="Total materiales asignados" valor={totalUnidades}>
          <p className="font-data text-xs text-gray-600">{materiales.length} tipo(s) de material</p>
        </MetricCard>
        <MetricCard etiqueta="Solicitudes pendientes" valor={pendientes}>
          <p className="font-data text-xs text-gray-600">En revisión por la administración</p>
        </MetricCard>
        <MetricCard etiqueta="Nueva Solicitud">
          <p className="font-data text-sm text-gray-700">
            Solicita materiales de los contratos vigentes (máx. $3.000.000 COP).
          </p>
          <button className="btn-primary" onClick={() => setModal('solicitud')}>
            + Nueva Solicitud
          </button>
        </MetricCard>
      </div>

      {/* Ventanas emergentes: solo se muestra la que coincide con el estado "modal" */}
      <DevolucionModal
        abierto={modal === 'devolucion'}
        onCerrar={cerrar}
        instructorId={usuario.id}
        materiales={materiales}
        onExito={mostrar}
      />
      <EvidenciaModal
        abierto={modal === 'evidencia'}
        onCerrar={cerrar}
        instructorId={usuario.id}
        materiales={materialesEvidencia}
        onExito={mostrar}
      />
      <SolicitudMaterialesModal
        abierto={modal === 'solicitud'}
        onCerrar={cerrar}
        usuario={usuario}
        onExito={mostrar}
      />
      {/* Aviso de confirmación */}
      {toast}
    </>
  );
}

export default PanelInstructor;
