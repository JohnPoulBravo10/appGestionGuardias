import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * URL base del API Gateway.
 */
const API_BASE_URL = 'http://localhost:8090'

/**
 * Rutas internas del único frontend.
 */
const REDIRECT_ROUTES = {
  ADMINISTRADOR: '/admin',
  EMPLEADO: '/empleado',
  DEFAULT: '/empleado',
}

/**
 * Decodifica el payload de un JWT sin verificar la firma.
 *
 * La validación real del JWT debe hacerse en el backend.
 */
function decodeJwtPayload(token) {
  const partes = token.split('.')

  if (partes.length !== 3) {
    throw new Error('El token recibido no tiene un formato JWT válido')
  }

  const payloadBase64 = partes[1]
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  /*
   * atob necesita que el Base64 tenga una longitud válida.
   * Agregamos "=" cuando sea necesario.
   */
  const padding = '='.repeat((4 - (payloadBase64.length % 4)) % 4)

  const payloadJson = atob(payloadBase64 + padding)

  return JSON.parse(payloadJson)
}

/**
 * Extrae el rol del usuario desde el payload del JWT.
 *
 * Soporta roles como:
 * [{ authority: "ROLE_ADMINISTRADOR" }]
 *
 * También soporta:
 * ["ROLE_ADMINISTRADOR"]
 */
function extractRolFromPayload(payload) {
  const roles = payload.roles || payload.authorities || []

  if (!Array.isArray(roles) || roles.length === 0) {
    return null
  }

  const primerRol = roles[0]

  const authority =
    typeof primerRol === 'string'
      ? primerRol
      : primerRol.authority || ''

  return authority.replace(/^ROLE_/, '')
}

/**
 * Hook encargado de la lógica del formulario de login.
 */
export default function useLoginForm() {
  const navigate = useNavigate()

  /* Estado del formulario */
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  /* Estado de interfaz */
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [fieldErrors, setFieldErrors] = useState({
    usuario: '',
    password: '',
  })

  /**
   * Valida los campos antes de enviar la solicitud.
   */
  const validarCampos = useCallback(() => {
    const errores = {
      usuario: '',
      password: '',
    }

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
   * Navega a la sección correspondiente según el rol.
   */
  const redirigirPorRol = useCallback(
    (rol) => {
      const destino =
        REDIRECT_ROUTES[rol] || REDIRECT_ROUTES.DEFAULT

      navigate(destino, {
        replace: true,
      })
    },
    [navigate]
  )

  /**
   * Envía las credenciales al backend.
   */
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()

      setError('')

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
              Accept: 'application/json',
            },
            body: JSON.stringify({
              usuario: usuario.trim(),
              password,
            }),
          }
        )

        if (!response.ok) {
          if (
            response.status === 401 ||
            response.status === 403
          ) {
            setError('Usuario o contraseña incorrectos')
          } else {
            setError(
              `Error del servidor (${response.status}). Intente nuevamente.`
            )
          }

          return
        }

        const data = await response.json()
        const token = data.token

        if (!token) {
          throw new Error(
            'El servidor no devolvió un token de autenticación'
          )
        }

        localStorage.setItem('token', token)

        const payload = decodeJwtPayload(token)
        const rol = extractRolFromPayload(payload)

        if (!rol) {
          localStorage.removeItem('token')
          setError(
            'No se pudo identificar el rol del usuario'
          )
          return
        }

        redirigirPorRol(rol)
      } catch (err) {
        console.error('Error durante el login:', err)

        setError(
          'No se pudo conectar con el servidor. Verifique que el servicio esté activo.'
        )
      } finally {
        setIsLoading(false)
      }
    },
    [
      usuario,
      password,
      validarCampos,
      redirigirPorRol,
    ]
  )

  /**
   * Alterna la visibilidad de la contraseña.
   */
  const togglePassword = useCallback(() => {
    setShowPassword((valorAnterior) => !valorAnterior)
  }, [])

  return {
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
  }
}