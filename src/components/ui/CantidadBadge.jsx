// Círculo verde que muestra una cantidad (por ejemplo, unidades de un material).
function CantidadBadge({ valor }) {
  return (
    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-sena-primary px-2 font-title text-sm font-bold text-white">
      {valor}
    </span>
  );
}

export default CantidadBadge;
