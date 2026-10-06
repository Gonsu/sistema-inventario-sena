import { Modal } from './Modal';

export function ConfirmDialog({
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
