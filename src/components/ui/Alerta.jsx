// Recuadro para mostrar mensajes al usuario.
// tipo = 'error' (rojo) o cualquier otro valor para un mensaje de éxito (verde).
function Alerta({ tipo = 'error', children }) {
  // Elegir los colores según el tipo de mensaje
  const estilos =
    tipo === 'error'
      ? 'border-red-300 bg-red-50 text-red-700'
      : 'border-green-300 bg-green-50 text-green-800';

  return (
    <div
      role={tipo === 'error' ? 'alert' : 'status'}
      className={`rounded-input border px-3 py-2 font-data text-sm ${estilos}`}
    >
      {children}
    </div>
  );
}

export default Alerta;
