// Tarjeta con un indicador: una etiqueta arriba y un número grande debajo.
// Es el mismo tipo de tarjeta que usa la pantalla de Inicio de AmbiGest.
function MetricCard({ etiqueta, valor, children }) {
  return (
    <div className="card flex flex-col justify-between gap-3">
      <p className="font-title text-xs font-semibold uppercase tracking-wide text-sena-primary">
        {etiqueta}
      </p>
      {/* El número solo se muestra si se envió un valor */}
      {valor !== undefined && (
        <p className="font-title text-4xl font-extrabold text-sena-header">{valor}</p>
      )}
      {children}
    </div>
  );
}

export default MetricCard;
