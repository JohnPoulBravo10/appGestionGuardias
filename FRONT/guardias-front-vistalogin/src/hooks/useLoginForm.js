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
 * useLoginForm — Custom hook que encapsula toda la lógica del formulario de login.
 *
 * Responsabilidades:
 * - Estado del formulario (usuario, password, showPassword)
 * - Validación de campos antes del submit
 * - Llamada al endpoint GET /api/empleados/login
 * - Manejo de estados de carga y error
 * - Redirección por rol tras login exitoso
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
   * Usa un pequeño delay para que el usuario perciba el login exitoso.
   */
  const redirigirPorRol = useCallback((rol) => {
    const destino = REDIRECT_URLS[rol] || REDIRECT_URLS.DEFAULT
    // Breve pausa para feedback visual antes de redirigir
    setTimeout(() => {
      window.location.href = destino
    }, 300)
  }, [])

  /**
   * Handler del submit del formulario.
   * Valida campos → llama al API → redirige o muestra error.
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
      const params = new URLSearchParams({ usuario: usuario.trim(), password })
      const response = await fetch(
        `${API_BASE_URL}/api/empleados/login?${params.toString()}`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          setError('Usuario o contraseña incorrectos')
        } else {
          setError(`Error del servidor (${response.status}). Intente nuevamente.`)
        }
        return
      }

      const empleado = await response.json()
      redirigirPorRol(empleado.rol)

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
