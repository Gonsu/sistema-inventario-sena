// Importar herramientas básicas de React
import { useState } from 'react';

// Importar el usuario en sesión
import { useUsuarioActual } from '../context/AuthContext';

// Importar los datos del inventario (se actualizan solos cuando cambian)
import { useCatalogo, useSolicitudes } from '../hooks/useInventarioData';

// Importar la regla de negocio que acepta una solicitud y descuenta el stock
import { aceptarSolicitud } from '../services/inventario';

// Importar el formato de pesos colombianos
import { formatCOP } from '../utils/format';

// Importar los componentes propios del panel administrativo
import ContratoEditModal from '../components/admin/ContratoEditModal';
import ContratosGrid from '../components/admin/ContratosGrid';
import EvidenciasAdminTable from '../components/admin/EvidenciasAdminTable';
import HistorialAdmin from '../components/admin/HistorialAdmin';
import SolicitudDetalleModal from '../components/admin/SolicitudDetalleModal';
import SolicitudesCompraTable from '../components/admin/SolicitudesCompraTable';
import SolicitudesPendientesTable from '../components/admin/SolicitudesPendientesTable';

// Importar componentes visuales reutilizables
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Alerta from '../components/ui/Alerta';
import SectionCard from '../components/ui/SectionCard';

// Importar el aviso flotante de confirmación
import { useToast } from '../hooks/useToast';

// Pantalla principal del personal administrativo.
// Desde aquí se aprueban solicitudes, se revisa el historial,
// se editan los contratos y se revisan evidencias y solicitudes de compra.
function PanelAdministrativo() {
  // Datos que necesita la pantalla
  const usuario = useUsuarioActual();
  const solicitudes = useSolicitudes();
  const { contratos, items, itemPorId } = useCatalogo();
  const { mostrar, toast } = useToast();

  // Estados de las ventanas emergentes:
  //  - contratoId: contrato que se está editando
  //  - verId: solicitud que se está viendo en detalle
  //  - aceptarId: solicitud que se va a aceptar (abre la confirmación)
  // Se guardan ids (no objetos) para que los modales reflejen cambios hechos en otras pestañas.
  const [contratoId, setContratoId] = useState(null);
  const [verId, setVerId] = useState(null);
  const [aceptarId, setAceptarId] = useState(null);
  const [errorAceptar, setErrorAceptar] = useState(null);

  // Buscar los objetos completos a partir de los ids guardados
  const pendientes = solicitudes.filter((s) => s.estado === 'pendiente');
  const solicitudVer = solicitudes.find((s) => s.id === verId) ?? null;
  const solicitudAceptar = pendientes.find((s) => s.id === aceptarId) ?? null;
  const contratoEditar = contratos.find((c) => c.id === contratoId) ?? null;

  // Abre la ventana de confirmación para aceptar una solicitud
  const pedirAceptar = (s) => {
    setErrorAceptar(null);
    setAceptarId(s.id);
  };

  // Se ejecuta cuando el administrativo confirma: asigna los materiales al instructor
  const confirmarAceptar = () => {
    if (!solicitudAceptar) return;
    try {
      aceptarSolicitud(solicitudAceptar.id, usuario.id);
      mostrar(`Solicitud ${solicitudAceptar.numero} aceptada y materiales asignados.`);
      setAceptarId(null);
      setVerId(null);
      // Si no hay stock suficiente u otro problema, se muestra el error dentro de la ventana
    } catch (e) {
      setErrorAceptar(e.message);
    }
  };

  // Todo componente de React debe retornar un solo contenedor padre
  return (
    <>
      <div>
        {/* Título de la pantalla */}
        <h1 className="text-2xl">Panel Administrativo</h1>
        <p className="font-data text-sm text-sena-header/80">
          Gestión de inventario, contratos y solicitudes
        </p>
      </div>

      {/* Solicitudes que esperan aprobación */}
      <SolicitudesPendientesTable
        pendientes={pendientes}
        onVer={(s) => setVerId(s.id)}
        onAceptar={pedirAceptar}
      />

      {/* Historial general de movimientos */}
      <HistorialAdmin />

      {/* Tarjetas de los contratos (Electrónica, Mobiliario, Herramientas) */}
      <ContratosGrid contratos={contratos} items={items} onEditar={(c) => setContratoId(c.id)} />

      {/* Evidencias subidas por los instructores y solicitudes de compra */}
      <SectionCard titulo="Evidencias y Solicitudes">
        <div className="space-y-8">
          <EvidenciasAdminTable />
          <SolicitudesCompraTable solicitudes={solicitudes} onVer={(s) => setVerId(s.id)} />
        </div>
      </SectionCard>

      {/* Ventana con el detalle de una solicitud */}
      <SolicitudDetalleModal
        solicitud={solicitudVer}
        itemPorId={itemPorId}
        onCerrar={() => setVerId(null)}
        onAceptar={pedirAceptar}
      />

      {/* Ventana para editar un contrato */}
      <ContratoEditModal
        contrato={contratoEditar}
        items={items}
        usuarioId={usuario.id}
        onCerrar={() => setContratoId(null)}
        onExito={mostrar}
      />

      {/* Confirmación antes de aceptar una solicitud */}
      <ConfirmDialog
        abierto={!!aceptarId}
        titulo="Aceptar solicitud"
        textoConfirmar="Aceptar y asignar"
        onCancelar={() => setAceptarId(null)}
        onConfirmar={confirmarAceptar}
        mensaje={
          solicitudAceptar ? (
            <div className="space-y-3">
              <p>
                Se descontarán del inventario los materiales de <b>{solicitudAceptar.numero}</b> (
                {formatCOP(solicitudAceptar.valorTotal)}) y se asignarán a{' '}
                <b>
                  {solicitudAceptar.formulario.nombre} {solicitudAceptar.formulario.apellido}
                </b>
                . Esta acción no se puede deshacer.
              </p>
              {errorAceptar && <Alerta>{errorAceptar}</Alerta>}
            </div>
          ) : (
            <Alerta>La solicitud ya fue procesada desde otra sesión.</Alerta>
          )
        }
      />

      {/* Aviso de confirmación */}
      {toast}
    </>
  );
}

export default PanelAdministrativo;
