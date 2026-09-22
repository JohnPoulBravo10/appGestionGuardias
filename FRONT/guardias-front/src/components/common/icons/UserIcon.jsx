// Ícono SVG de usuario / perfil
function UserIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="35"
        r="18"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />

      <path
        d="M 20 90 C 20 65, 30 55, 50 55 C 70 55, 80 65, 80 90"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default UserIcon;
