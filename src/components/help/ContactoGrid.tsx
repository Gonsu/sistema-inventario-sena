import { useState, type ReactNode } from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';

function IconoCirculo({ children }: { children: ReactNode }) {
  return <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-sena-primary text-white">{children}</div>;
}

function TarjetaContacto({ icono, titulo, children }: { icono: ReactNode; titulo: string; children: ReactNode }) {
  return (
    <div className="card flex flex-col items-center text-center">
      <IconoCirculo>{icono}</IconoCirculo>
      <h3 className="mb-2 text-lg">{titulo}</h3>
      {children}
    </div>
  );
}

export function ContactoGrid() {
  const [chatActivo, setChatActivo] = useState(false);

  return (
    <section>
      <h2 className="mb-4 text-xl">Contacto y Soporte</h2>
      <div className="grid gap-6 md:grid-cols-3">
        <TarjetaContacto icono={<Phone className="h-6 w-6" aria-hidden />} titulo="Teléfono">
          <a href="tel:+5712345678" className="font-data text-base font-semibold text-sena-primary hover:underline">+57 (1) 234-5678</a>
          <p className="mt-1 font-data text-sm text-gray-600">Lunes a Viernes 8:00 AM - 6:00 PM</p>
        </TarjetaContacto>

        <TarjetaContacto icono={<Mail className="h-6 w-6" aria-hidden />} titulo="Correo Electrónico">
          <a href="mailto:soporte@sena.edu.co" className="font-data text-base font-semibold text-sena-primary hover:underline">soporte@sena.edu.co</a>
          <p className="mt-1 font-data text-sm text-gray-600">Respuesta estimada: 24-48 horas</p>
        </TarjetaContacto>

        <TarjetaContacto icono={<MessageCircle className="h-6 w-6" aria-hidden />} titulo="Chat en Vivo">
          {chatActivo ? (
            <div role="status" className="w-full space-y-2">
              <p className="flex items-center justify-center gap-2 font-data text-sm font-semibold text-sena-primary">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" aria-hidden />
                Chat activo — un agente te atenderá en breve
              </p>
              <button type="button" className="btn-secondary w-full" onClick={() => setChatActivo(false)}>Finalizar chat</button>
            </div>
          ) : (
            <>
              <p className="mb-3 font-data text-sm text-gray-600">Atención inmediata en horario laboral</p>
              <button type="button" className="btn-primary w-full" onClick={() => setChatActivo(true)}>Iniciar Chat</button>
            </>
          )}
        </TarjetaContacto>
      </div>
    </section>
  );
}
