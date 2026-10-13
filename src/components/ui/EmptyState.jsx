// Mensaje que se muestra cuando una tabla o lista no tiene datos.
function EmptyState({ mensaje }) {
  return (
    <p className="rounded-input border border-dashed border-sena-card-border bg-white/50 px-4 py-8 text-center font-data text-gray-500">
      {mensaje}
    </p>
  );
}

export default EmptyState;
