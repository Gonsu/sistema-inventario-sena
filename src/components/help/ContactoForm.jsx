import { useState } from 'react';
import { Send } from 'lucide-react';
import { Alerta } from '../ui/Primitives';

const MIN_MENSAJE = 10;

export function ContactoForm() {
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  const enviar = (e) => {
    e.preventDefault();
    setExito(null);
    if (!asunto.trim()) return setError('Escribe el asunto de tu consulta.');
    if (mensaje.trim().length < MIN_MENSAJE)
      return setError(`El mensaje debe tener al menos ${MIN_MENSAJE} caracteres.`);
    setError(null);
    setExito(`Mensaje "${asunto.trim()}" enviado. Soporte te responderá en 24-48 horas.`);
    setAsunto('');
    setMensaje('');
  };

  return (
    <section className="card">
      <h2 className="mb-1 text-xl">Formulario de Contacto Directo</h2>
      <p className="mb-4 font-data text-sm text-gray-600">
        Describe tu consulta y el equipo de soporte te contactará.
      </p>
      <form onSubmit={enviar} noValidate className="space-y-4">
        <div>
          <label className="label" htmlFor="contacto-asunto">
            Asunto
          </label>
          <input
            id="contacto-asunto"
            className="input"
            value={asunto}
            maxLength={120}
            onChange={(e) => setAsunto(e.target.value)}
            placeholder="Ej. No puedo adjuntar el PDF de mi solicitud"
          />
        </div>
        <div>
          <label className="label" htmlFor="contacto-mensaje">
            Mensaje
          </label>
          <textarea
            id="contacto-mensaje"
            className="input resize-y"
            rows={5}
            maxLength={2000}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Cuéntanos con detalle qué ocurre…"
          />
        </div>
        {error && <Alerta>{error}</Alerta>}
        {exito && <Alerta tipo="exito">{exito}</Alerta>}
        <button type="submit" className="btn-primary">
          <Send className="h-4 w-4" aria-hidden />
          Enviar Mensaje
        </button>
      </form>
    </section>
  );
}
