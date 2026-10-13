// Colores disponibles para la etiqueta. Cada "tono" es un grupo de clases de Tailwind.
const TONOS = {
  verde: 'bg-green-100 text-green-800 ring-green-600/30',
  verdeOscuro: 'bg-sena-header text-white ring-sena-header',
  rojo: 'bg-red-100 text-red-700 ring-red-600/30',
  amarillo: 'bg-yellow-100 text-yellow-800 ring-yellow-600/30',
  gris: 'bg-gray-100 text-gray-700 ring-gray-500/30',
};

// Etiqueta pequeña y redondeada para mostrar estados (Pendiente, Aprobada, etc.).
function Badge({ tono = 'verde', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-title text-xs font-semibold ring-1 ring-inset ${TONOS[tono]}`}
    >
      {children}
    </span>
  );
}

export default Badge;
