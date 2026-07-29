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
  const inputType = isPassword
    ? showPassword
      ? 'text'
      : 'password'
    : type

  const inputClasses = [
    'login-input',
    isPassword
      ? 'login-input--password'
      : '',
    hasError
      ? 'login-input--invalid'
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="login-field">
      <label
        className="login-label"
        htmlFor={id}
      >
        {label}
      </label>

      <div className="login-input-wrapper">
        <span
          className="login-input-icon"
          aria-hidden="true"
        >
          {icon}
        </span>

        <input
          id={id}
          className={inputClasses}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${id}-error`
              : undefined
          }
          required
        />

        {isPassword && (
          <button
            type="button"
            className="login-toggle-password"
            onClick={onToggle}
            aria-label={
              showPassword
                ? 'Ocultar contraseña'
                : 'Mostrar contraseña'
            }
          >
            {showPassword
              ? <EyeOffIcon />
              : <EyeIcon />}
          </button>
        )}
      </div>

      {hasError && errorMessage && (
        <span
          id={`${id}-error`}
          className="login-field-error"
        >
          {errorMessage}
        </span>
      )}
    </div>
  )
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />

      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />

      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />

      <line
        x1="1"
        y1="1"
        x2="23"
        y2="23"
      />
    </svg>
  )
}

export default LoginInput