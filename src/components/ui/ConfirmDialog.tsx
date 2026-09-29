import type { ReactNode } from 'react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  abierto: boolean;
  titulo: string;
  mensaje: ReactNode;
  textoConfirmar?: string;
  procesando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmDialog({ abierto, titulo, mensaje, textoConfirmar = 'Confirmar', procesando, onConfirmar, onCancelar }: ConfirmDialogProps) {
  return (
    <Modal
      abierto={abierto}
      titulo={titulo}
      onCerrar={onCancelar}
      ancho="md"
      pie={
        <>
          <button className="btn-secondary" onClick={onCancelar} disabled={procesando}>Cancelar</button>
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
