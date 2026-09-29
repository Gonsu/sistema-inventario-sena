import { useState } from 'react';
import type { Solicitud } from '../types';
import { useUsuarioActual } from '../context/AuthContext';
import { useCatalogo, useSolicitudes } from '../hooks/useInventarioData';
import { aceptarSolicitud } from '../services/inventario';
import { formatCOP } from '../utils/format';
import { ContratoEditModal } from '../components/admin/ContratoEditModal';
import { ContratosGrid } from '../components/admin/ContratosGrid';
import { EvidenciasAdminTable } from '../components/admin/EvidenciasAdminTable';
import { HistorialAdmin } from '../components/admin/HistorialAdmin';
import { SolicitudDetalleModal } from '../components/admin/SolicitudDetalleModal';
import { SolicitudesCompraTable } from '../components/admin/SolicitudesCompraTable';
import { SolicitudesPendientesTable } from '../components/admin/SolicitudesPendientesTable';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Alerta, SectionCard } from '../components/ui/Primitives';
import { useToast } from '../components/ui/Toast';

export default function AdminDashboard() {
  const usuario = useUsuarioActual();
  const solicitudes = useSolicitudes();
  const { contratos, items, itemPorId } = useCatalogo();
  const { mostrar, toast } = useToast();

  // Se guardan ids (no objetos) para que los modales reflejen cambios hechos en otras pestañas.
  const [contratoId, setContratoId] = useState<string | null>(null);
  const [verId, setVerId] = useState<string | null>(null);
  const [aceptarId, setAceptarId] = useState<string | null>(null);
  const [errorAceptar, setErrorAceptar] = useState<string | null>(null);

  const pendientes = solicitudes.filter((s) => s.estado === 'pendiente');
  const solicitudVer = solicitudes.find((s) => s.id === verId) ?? null;
  const solicitudAceptar = pendientes.find((s) => s.id === aceptarId) ?? null;
  const contratoEditar = contratos.find((c) => c.id === contratoId) ?? null;

  const pedirAceptar = (s: Solicitud) => {
    setErrorAceptar(null);
    setAceptarId(s.id);
  };

  const confirmarAceptar = () => {
    if (!solicitudAceptar) return;
    try {
      aceptarSolicitud(solicitudAceptar.id, usuario.id);
      mostrar(`Solicitud ${solicitudAceptar.numero} aceptada y materiales asignados.`);
      setAceptarId(null);
      setVerId(null);
    } catch (e) {
      setErrorAceptar((e as Error).message);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-2xl">Panel Administrativo</h1>
        <p className="font-data text-sm text-sena-header/80">Gestión de inventario, contratos y solicitudes</p>
      </div>

      <SolicitudesPendientesTable pendientes={pendientes} onVer={(s) => setVerId(s.id)} onAceptar={pedirAceptar} />

      <HistorialAdmin />

      <ContratosGrid contratos={contratos} items={items} onEditar={(c) => setContratoId(c.id)} />

      <SectionCard titulo="Evidencias y Solicitudes">
        <div className="space-y-8">
          <EvidenciasAdminTable />
          <SolicitudesCompraTable solicitudes={solicitudes} onVer={(s) => setVerId(s.id)} />
        </div>
      </SectionCard>

      <SolicitudDetalleModal solicitud={solicitudVer} itemPorId={itemPorId} onCerrar={() => setVerId(null)} onAceptar={pedirAceptar} />

      <ContratoEditModal contrato={contratoEditar} items={items} usuarioId={usuario.id} onCerrar={() => setContratoId(null)} onExito={mostrar} />

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
                Se descontarán del inventario los materiales de <b>{solicitudAceptar.numero}</b> ({formatCOP(solicitudAceptar.valorTotal)}) y se asignarán a{' '}
                <b>{solicitudAceptar.formulario.nombre} {solicitudAceptar.formulario.apellido}</b>. Esta acción no se puede deshacer.
              </p>
              {errorAceptar && <Alerta>{errorAceptar}</Alerta>}
            </div>
          ) : (
            <Alerta>La solicitud ya fue procesada desde otra sesión.</Alerta>
          )
        }
      />
      {toast}
    </>
  );
}
