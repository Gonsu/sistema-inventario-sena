// Importar herramientas básicas de React
import { useEffect, useState } from 'react';

// Importar las reglas de negocio del inventario
import { registrarEvidencia } from '../../services/inventario';

// Importar los textos que se muestran para cada valor
import { EVIDENCIA_TIPO_LABEL } from '../../utils/labels';

// Importar componentes visuales reutilizables
import Modal from '../ui/Modal';
import Alerta from '../ui/Alerta';

// Importar componentes de esta misma sección
import FotoEvidenciaPanel from './FotoEvidenciaPanel';

// Ventana para cargar una nueva evidencia fotográfica.
// A la izquierda se sube o toma la foto; a la derecha se elige el material y se escribe una nota.
function EvidenciaModal({ abierto, onCerrar, instructorId, materiales, onExito }) {
  // Estados del formulario
  const [foto, setFoto] = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [itemId, setItemId] = useState('');
  const [tipo, setTipo] = useState('uso');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState(null);

  // Cada vez que se abre la ventana, empezar con el formulario vacío
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

  // Guardar la evidencia y cerrar la ventana
  const guardar = () => {
    try {
      registrarEvidencia({
        instructorId,
        itemId,
        tipo,
        descripcion: mensaje,
        archivo: foto ?? '',
        nombreArchivo,
      });
      onExito('Evidencia guardada correctamente.');
      onCerrar();
      // Si algo falla, mostrar el error
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Modal
      abierto={abierto}
      titulo="Cargar Nueva Evidencia"
      onCerrar={onCerrar}
      ancho="xl"
      // Botones de abajo: "Guardar" solo se activa si hay foto, material y nota
      pie={
        <>
          <button className="btn-secondary" onClick={onCerrar}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={guardar}
            disabled={!foto || !itemId || !mensaje.trim()}
          >
            Guardar evidencia
          </button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Columna izquierda: foto */}
        <FotoEvidenciaPanel
          foto={foto}
          onFoto={(data, nombre) => {
            setFoto(data);
            setNombreArchivo(nombre);
          }}
        />

        {/* Columna derecha: datos de la evidencia */}
        <div className="flex flex-col gap-3">
          <h3 className="text-base">Mensaje</h3>
          <div>
            <label className="label" htmlFor="ev-material">
              Material
            </label>
            <select
              id="ev-material"
              className="input"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
            >
              <option value="">Selecciona un material…</option>
              {materiales.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.codigo} — {m.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ev-tipo">
              Tipo de evidencia
            </label>
            <select
              id="ev-tipo"
              className="input"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              {Object.entries(EVIDENCIA_TIPO_LABEL).map(([valor, label]) => (
                <option key={valor} value={valor}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-1 flex-col">
            <label className="label" htmlFor="ev-mensaje">
              Notas sobre la evidencia
            </label>
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
          {/* Mensaje de error */}
          {error && <Alerta>{error}</Alerta>}
        </div>
      </div>
    </Modal>
  );
}

export default EvidenciaModal;
