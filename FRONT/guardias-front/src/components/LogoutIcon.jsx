/**
 * LogoutIcon – Ícono SVG de cerrar sesión.
 * Componente puro sin estado.
 */
function LogoutIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Contorno de la puerta (caja abierta por la derecha) */}
      <path
        d="M 60 20 L 25 20 C 22 20 20 22 20 25 L 20 75 C 20 78 22 80 25 80 L 60 80"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Flecha apuntando hacia afuera */}
      <path
        d="M 40 50 L 85 50 M 70 35 L 85 50 L 70 65"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default LogoutIcon;
