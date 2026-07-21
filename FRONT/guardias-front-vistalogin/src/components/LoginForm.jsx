import ShieldIcon from './ShieldIcon'
import LoginInput from './LoginInput'
import useLoginForm from '../hooks/useLoginForm'

/**
 * LoginForm — Formulario principal de inicio de sesión.
 *
 * Componente presentacional que delega la lógica al hook useLoginForm.
 * Renderiza: header con branding, campos de usuario/contraseña,
 * mensajes de error, y botón de submit con estado de carga.
 */
function LoginForm() {
  const {
    usuario,
    setUsuario,
    password,
    setPassword,
    showPassword,
    togglePassword,
    isLoading,
    error,
    fieldErrors,
    handleSubmit,
  } = useLoginForm()

  return (
    <div className="login-card">
      {/* --- Header: Escudo + Título + Subtítulo --- */}
      <header className="login-header">
        <ShieldIcon className="login-shield" />
        <h1 className="login-title">SGGS</h1>
        <p className="login-subtitle">Sistema de Gestión de Guardias de Salud</p>
      </header>

      {/* --- Formulario --- */}
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        {/* Campo: Usuario */}
        <LoginInput
          id="login-usuario"
          label="Usuario"
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          placeholder="Ingrese su usuario"
          autoComplete="username"
          icon={<UserIcon />}
          hasError={!!fieldErrors.usuario}
          errorMessage={fieldErrors.usuario}
        />

        {/* Campo: Contraseña */}
        <LoginInput
          id="login-password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingrese su contraseña"
          autoComplete="current-password"
          icon={<LockIcon />}
          isPassword
          showPassword={showPassword}
          onToggle={togglePassword}
          hasError={!!fieldErrors.password}
          errorMessage={fieldErrors.password}
        />

        {/* Mensaje de error de autenticación */}
        {error && (
          <div className="login-error" role="alert">
            <AlertIcon />
            <span className="login-error-text">{error}</span>
          </div>
        )}

        {/* Botón: Iniciar Sesión */}
        <button
          id="login-submit-btn"
          type="submit"
          className={`login-submit ${isLoading ? 'login-submit--loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="login-spinner" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>
    </div>
  )
}

/* --- Íconos SVG inline --- */

/** Ícono de usuario para el campo de nombre de usuario */
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

/** Ícono de candado para el campo de contraseña */
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

/** Ícono de alerta para los mensajes de error */
function AlertIcon() {
  return (
    <svg className="login-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

export default LoginForm
