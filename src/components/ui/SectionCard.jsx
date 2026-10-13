// Tarjeta blanca con título que envuelve cada sección de un panel.
// Recibe:
//  - titulo: texto que se muestra arriba
//  - acciones: botones o buscadores que van a la derecha del título (opcional)
//  - children: el contenido de la sección
function SectionCard({ titulo, acciones, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {/* Encabezado de la tarjeta: título a la izquierda y acciones a la derecha */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl">{titulo}</h2>
        {acciones}
      </div>
      {children}
    </section>
  );
}

export default SectionCard;
