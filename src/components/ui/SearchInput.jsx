// Campo de búsqueda con el ícono de lupa a la izquierda.
// Cada vez que el usuario escribe, se le avisa al componente padre con onChange.
function SearchInput({ value, onChange, placeholder = 'Buscar…' }) {
  return (
    <div className="relative w-full sm:w-72">
      {/* Ícono de lupa (solo decorativo) */}
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        aria-hidden
      >
        ⌕
      </span>
      <input
        type="search"
        className="input pl-8"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}

export default SearchInput;
