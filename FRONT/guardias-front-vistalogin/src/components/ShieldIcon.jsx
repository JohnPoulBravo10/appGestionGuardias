/**
 * ShieldIcon — Ícono SVG del escudo SGGS.
 * Componente puro sin estado, renderiza el ícono del branding.
 */
function ShieldIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Contorno del escudo */}
      <path
        d="M50 8 L85 28 V58 C85 78 68 92 50 98 C32 92 15 78 15 58 V28 Z"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      {/* Signo de exclamación (punto) */}
      <circle cx="50" cy="64" r="4" fill="currentColor" />
      {/* Signo de exclamación (línea) */}
      <line
        x1="50"
        y1="36"
        x2="50"
        y2="54"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default ShieldIcon
