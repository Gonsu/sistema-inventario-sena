/** Marca simplificada. Reemplazar por el logo oficial en src/assets si se dispone del archivo. */
export function SenaLogo({ className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="SENA">
      <circle cx="32" cy="32" r="30" fill="#ffffff" />
      <circle cx="32" cy="22" r="7" fill="#39A900" />
      <path
        d="M14 46 L32 32 L50 46"
        stroke="#39A900"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="18" y="49" width="28" height="5" rx="2.5" fill="#39A900" />
    </svg>
  );
}
