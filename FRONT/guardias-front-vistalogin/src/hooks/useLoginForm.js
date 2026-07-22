import { useState, useCallback } from 'react'

/**
 * URL base del API Gateway.
 * En desarrollo apunta a localhost:8090; en Docker se reemplaza por el hostname interno.
 */
const API_BASE_URL = 'http://localhost:8090'

/**
 * URLs de redirección según el rol del usuario autenticado.
 * ADMINISTRADOR redirige al panel de administración;
 * cualquier otro rol redirige al panel de empleados.
 */
const REDIRECT_URLS = {
  ADMINISTRADOR: 'http://localhost:5173',
  DEFAULT: 'http://localhost:5174',
}

/**
 * Decodifica el payload de un JWT (sin verificar firma).
 * Extrae las claims del token para uso client-side (e.g., rol para redirección).
 *
 * @param {string} token - JWT completo (header.payload.signature)
 * @returns {Object} Claims decodificadas del payload
 */
function decodeJwtPayload(token) {
  const payloadBase64 = token.split('.')[1]
  // Reemplaza caracteres URL-safe y decodifica
  const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
  return JSON.parse(payloadJson)
}

/**
 * Extrae el rol principal del payload JWT.
 * El claim "roles" es un array de objetos con forma { authority: "ROLE_XXX" }.
 *
 * @param {Object} payload - Claims decodificadas del JWT
 * @returns {string} Nombre del rol sin prefijo "ROLE_" (e.g., "ADMINISTRADOR")
 */
function extractRolFromPayload(payload) {
  const roles = payload.roles || []
  if (roles.length === 0) {
    return null
  }
  // Cada authority tiene formato "ROLE_ADMINISTRADOR" o "ROLE_EMPLEADO"
  const authority = roles[0].authority || ''
  return authority.replace(/^ROLE_/, '')
}

/**
 * useLoginForm — Custom hook que encapsula toda la lógica del formulario de login.
 *
 * Responsabilidades:
 * - Estado del formulario (usuario, password, showPassword)
 * - Validación de campos antes del submit
 * - Llamada al endpoint POST /auth/login con credenciales JSON
 * - Decodificación del JWT para extraer rol y redirigir
 * - Almacenamiento del token en localStorage
 * - Manejo de estados de carga y error
 *
 * @returns {Object} Estado y handlers del formulario
 */
export default function useLoginForm() {
  /* --- Estado del formulario --- */
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  /* --- Estado de UI --- */
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({
    usuario: '',
    password: '',
  })

  /**
   * Valida los campos del formulario.
   * @returns {boolean} true si todos los campos son válidos
   */
  const validarCampos = useCallback(() => {
    const errores = { usuario: '', password: '' }
    let esValido = true

    if (!usuario.trim()) {
      errores.usuario = 'El usuario es obligatorio'
      esValido = false
    }

    if (!password) {
      errores.password = 'La contraseña es obligatoria'
      esValido = false
    }

    setFieldErrors(errores)
    return esValido
  }, [usuario, password])

  /**
   * Redirige al frontend correspondiente según el rol del empleado.
   * Pasa el JWT como query parameter porque localStorage no se comparte
   * entre orígenes con distinto puerto (login:5175 → admin:5173/empleado:5174).
   * Usa un pequeño delay para que el usuario perciba el login exitoso.
   *
   * @param {string} rol - Rol extraído del JWT (e.g., "ADMINISTRADOR")
   * @param {string} token - JWT completo para pasar al frontend destino
   */
  const redirigirPorRol = useCallback((rol, token) => {
    const destino = REDIRECT_URLS[rol] || REDIRECT_URLS.DEFAULT
    const urlConToken = `${destino}?token=${encodeURIComponent(token)}`
    // Breve pausa para feedback visual antes de redirigir
    setTimeout(() => {
      window.location.href = urlConToken
    }, 300)
  }, [])

  /**
   * Handler del submit del formulario.
   * Valida campos → llama POST /auth/login → decodifica JWT → redirige por rol.
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    // Limpiar error previo
    setError('')

    // Validar campos obligatorios
    if (!validarCampos()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            usuario: usuario.trim(),
            password,
          }),
        }
      )

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Usuario o contraseña incorrectos')
        } else {
          setError(`Error del servidor (${response.status}). Intente nuevamente.`)
        }
        return
      }

      const { token } = await response.json()

      // Persistir JWT para uso en otros frontends (admin, empleados)
      localStorage.setItem('token', token)

      // Decodificar payload para extraer rol y redirigir con el token
      const payload = decodeJwtPayload(token)
      const rol = extractRolFromPayload(payload)
      redirigirPorRol(rol, token)

    } catch (err) {
      // Error de red (servidor caído, sin conexión, etc.)
      console.error('Error de conexión:', err)
      setError('No se pudo conectar con el servidor. Verifique que el servicio esté activo.')
    } finally {
      setIsLoading(false)
    }
  }, [usuario, password, validarCampos, redirigirPorRol])

  /** Alterna la visibilidad de la contraseña */
  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  return {
    // Estado de campos
    usuario,
    setUsuario,
    password,
    setPassword,
    showPassword,
    togglePassword,

    // Estado de UI
    isLoading,
    error,
    fieldErrors,

    // Acciones
    handleSubmit,
  }
}
