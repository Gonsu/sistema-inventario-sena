// Importar la ventana emergente base
import Modal from './Modal';

// Ventana para confirmar una acción importante (por ejemplo, aceptar una solicitud).
// Muestra un mensaje y dos botones: Cancelar y Confirmar.
function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  procesando,
  onConfirmar,
  onCancelar,
}) {
  return (
    <Modal
      abierto={abierto}
      titulo={titulo}
      onCerrar={onCancelar}
      ancho="md"
      // pie: botones de la parte de abajo de la ventana
      pie={
        <>
          <button className="btn-secondary" onClick={onCancelar} disabled={procesando}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={onConfirmar} disabled={procesando}>
            {procesando ? 'Procesando…' : textoConfirmar}
          </button>
        </>
      }
    >
      <div className="font-data text-sm text-gray-700">{mensaje}</div>
    </Modal>
  );
}

export default ConfirmDialog;
