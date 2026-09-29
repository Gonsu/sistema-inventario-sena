import { useEffect, useMemo, useState } from 'react';
import type { ArchivoAdjunto, PublicUser, SolicitudFormulario } from '../../types';
import { useCatalogo } from '../../hooks/useInventarioData';
import { calcularTotal, crearSolicitud } from '../../services/inventario';
import { PRESUPUESTO_MAX_SOLICITUD } from '../../utils/constants';
import { Modal } from '../ui/Modal';
import { Alerta } from '../ui/Primitives';
import { FormularioSena } from './FormularioSena';
import { PresupuestoBar } from './PresupuestoBar';
import { SeleccionMateriales, type SeleccionSolicitud } from './SeleccionMateriales';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  usuario: PublicUser;
  onExito: (mensaje: string) => void;
}

function formularioInicial(usuario: PublicUser): SolicitudFormulario {
  const [nombre = '', ...resto] = usuario.nombre.split(' ');
  return { nombre, apellido: resto.join(' '), programa: '', tipoFormacion: 'tecnologo' };
}

export function SolicitudMaterialesModal({ abierto, onCerrar, usuario, onExito }: Props) {
  const { items, contratos, itemPorId } = useCatalogo();
  const [fase, setFase] = useState<1 | 2>(1);
  const [seleccion, setSeleccion] = useState<SeleccionSolicitud>({});
  const [formulario, setFormulario] = useState(() => formularioInicial(usuario));
  const [pdf, setPdf] = useState<ArchivoAdjunto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [numero, setNumero] = useState('');
  const [fecha, setFecha] = useState('');
  const [enviando, setEnviando] = useState(false);

  const limpiar = () => {
    setFase(1);
    setSeleccion({});
    setFormulario(formularioInicial(usuario));
    setPdf(null);
    setError(null);
    setEnviando(false);
  };

  useEffect(() => {
    if (abierto) {
      limpiar();
      const ahora = Date.now();
      setNumero(`SOL-${ahora}`);
      setFecha(new Date(ahora).toISOString());
    }
  }, [abierto]);

  const lineas = useMemo(
    () =>
      Object.entries(seleccion).flatMap(([itemId, cantidad]) => {
        const item = itemPorId.get(itemId);
        return item ? [{ item, cantidad }] : [];
      }),
    [seleccion, itemPorId],
  );
  const total = calcularTotal(lineas.map(({ item, cantidad }) => ({ cantidad, valorUnitario: item.valorUnitario })));
  const excedido = total > PRESUPUESTO_MAX_SOLICITUD;

  const enviar = () => {
    setEnviando(true);
    try {
      const solicitud = crearSolicitud({
        instructorId: usuario.id,
        lineas: lineas.map(({ item, cantidad }) => ({ itemId: item.id, cantidad })),
        formulario,
        formatoPdf: pdf,
        numero,
      });
      onExito(`Solicitud ${solicitud.numero} enviada. Queda pendiente de aprobación.`);
      limpiar();
      onCerrar();
    } catch (e) {
      setError((e as Error).message);
      setEnviando(false);
    }
  };

  const pie =
    fase === 1 ? (
      <>
        <button className="btn-secondary" onClick={onCerrar}>Cancelar</button>
        <button
          className="btn-primary"
          disabled={lineas.length === 0 || excedido}
          onClick={() => {
            setError(null);
            setFase(2);
          }}
        >
          Continuar al formulario →
        </button>
      </>
    ) : (
      <>
        <button className="btn-secondary" onClick={() => setFase(1)} disabled={enviando}>← Volver</button>
        <button
          className="btn-primary"
          onClick={enviar}
          disabled={enviando || excedido || !pdf || !formulario.nombre.trim() || !formulario.apellido.trim() || !formulario.programa.trim()}
        >
          {enviando ? 'Enviando…' : 'Enviar solicitud'}
        </button>
      </>
    );

  return (
    <Modal abierto={abierto} titulo={fase === 1 ? 'Nueva Solicitud — Selección de materiales' : 'Nueva Solicitud — Formato SENA'} onCerrar={onCerrar} ancho="2xl" pie={pie}>
      <div className="space-y-4">
        <PresupuestoBar total={total} />
        {fase === 1 ? (
          <SeleccionMateriales items={items} contratos={contratos} seleccion={seleccion} onCambiar={setSeleccion} />
        ) : (
          <FormularioSena
            numero={numero}
            fecha={fecha}
            formulario={formulario}
            onFormulario={setFormulario}
            lineas={lineas}
            total={total}
            pdf={pdf}
            onPdf={setPdf}
            onError={setError}
          />
        )}
        {error && <Alerta>{error}</Alerta>}
      </div>
    </Modal>
  );
}
