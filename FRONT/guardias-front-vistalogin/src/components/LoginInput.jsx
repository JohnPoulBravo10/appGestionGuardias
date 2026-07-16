/**
 * LoginInput — Input reutilizable con ícono lateral y soporte
 * para toggle de visibilidad (campo de contraseña).
 *
 * Props:
 * - id:            Identificador único para el input y su label
 * - label:         Texto del label visible
 * - type:          Tipo HTML del input (text, password, etc.)
 * - value:         Valor controlado
 * - onChange:      Handler de cambio
 * - placeholder:   Texto placeholder
 * - icon:          Nodo JSX del ícono izquierdo
 * - hasError:      Boolean que aplica estilo de error
 * - errorMessage:  Texto del mensaje de error
 * - isPassword:    Boolean para activar el toggle de visibilidad
 * - showPassword:  Estado actual de visibilidad de la contraseña
 * - onToggle:      Handler para alternar visibilidad
 * - autoComplete:  Valor del atributo autocomplete
 */
function LoginInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  hasError = false,
  errorMessage = '',
  isPassword = false,
  showPassword = false,
  onToggle,
  autoComplete,
}) {
  /** Determina el tipo real del input según visibilidad */
  const inputType = isPassword
    ? (showPassword ? 'text' : 'password')
    : type

  /** Clases dinámicas del input */
  const inputClasses = [
    'login-input',
    isPassword ? 'login-input--password' : '',
    hasError ? 'login-input--invalid' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="login-field">
      <label className="login-label" htmlFor={id}>
        {label}
      </label>

      <div className="login-input-wrapper">
        {/* Ícono izquierdo */}
        <span className="login-input-icon">{icon}</span>

        <input
          id={id}
          className={inputClasses}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
        />

        {/* Botón de toggle de visibilidad (solo para contraseñas) */}
        {isPassword && (
          <button
            type="button"
            className="login-toggle-password"
            onClick={onToggle}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>

      {/* Mensaje de error de validación */}
      {hasError && errorMessage && (
        <span className="login-field-error">{errorMessage}</span>
      )}
    </div>
  )
}

/* --- Íconos SVG inline para ojo abierto / cerrado --- */

/** Ícono de ojo abierto (contraseña visible) */
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

/** Ícono de ojo cerrado (contraseña oculta) */
function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export default LoginInput
