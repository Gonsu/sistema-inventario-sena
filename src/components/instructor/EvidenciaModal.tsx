import { useEffect, useState } from 'react';
import type { EvidenciaTipo, ItemContrato } from '../../types';
import { registrarEvidencia } from '../../services/inventario';
import { EVIDENCIA_TIPO_LABEL } from '../../utils/labels';
import { Modal } from '../ui/Modal';
import { Alerta } from '../ui/Primitives';
import { FotoEvidenciaPanel } from './FotoEvidenciaPanel';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  instructorId: string;
  /** Materiales que el instructor puede referenciar (sus asignados, o todo el catálogo si no tiene). */
  materiales: Array<Pick<ItemContrato, 'id' | 'nombre' | 'codigo'>>;
  onExito: (mensaje: string) => void;
}

export function EvidenciaModal({ abierto, onCerrar, instructorId, materiales, onExito }: Props) {
  const [foto, setFoto] = useState<string | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [itemId, setItemId] = useState('');
  const [tipo, setTipo] = useState<EvidenciaTipo>('uso');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (abierto) {
      setFoto(null);
      setNombreArchivo('');
      setItemId('');
      setTipo('uso');
      setMensaje('');
      setError(null);
    }
  }, [abierto]);

  const guardar = () => {
    try {
      registrarEvidencia({ instructorId, itemId, tipo, descripcion: mensaje, archivo: foto ?? '', nombreArchivo });
      onExito('Evidencia guardada correctamente.');
      onCerrar();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Modal
      abierto={abierto}
      titulo="Cargar Nueva Evidencia"
      onCerrar={onCerrar}
      ancho="xl"
      pie={
        <>
          <button className="btn-secondary" onClick={onCerrar}>Cancelar</button>
          <button className="btn-primary" onClick={guardar} disabled={!foto || !itemId || !mensaje.trim()}>Guardar evidencia</button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <FotoEvidenciaPanel
          foto={foto}
          onFoto={(data, nombre) => {
            setFoto(data);
            setNombreArchivo(nombre);
          }}
        />

        <div className="flex flex-col gap-3">
          <h3 className="text-base">Mensaje</h3>
          <div>
            <label className="label" htmlFor="ev-material">Material</label>
            <select id="ev-material" className="input" value={itemId} onChange={(e) => setItemId(e.target.value)}>
              <option value="">Selecciona un material…</option>
              {materiales.map((m) => (
                <option key={m.id} value={m.id}>{m.codigo} — {m.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ev-tipo">Tipo de evidencia</label>
            <select id="ev-tipo" className="input" value={tipo} onChange={(e) => setTipo(e.target.value as EvidenciaTipo)}>
              {Object.entries(EVIDENCIA_TIPO_LABEL).map(([valor, label]) => (
                <option key={valor} value={valor}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-1 flex-col">
            <label className="label" htmlFor="ev-mensaje">Notas sobre la evidencia</label>
            <textarea
              id="ev-mensaje"
              className="input min-h-36 flex-1 resize-y"
              maxLength={1000}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Describe el estado del material, el contexto de uso o cualquier novedad…"
            />
            <p className="mt-1 text-right font-data text-xs text-gray-500">{mensaje.length}/1000</p>
          </div>
          {error && <Alerta>{error}</Alerta>}
        </div>
      </div>
    </Modal>
  );
}
