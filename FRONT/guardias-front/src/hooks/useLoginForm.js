import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { decodeJwtPayload } from '../utils/authUtils'

const API_BASE_URL = 'http://localhost:8090'

// Mapeo de rutas de redirección post-autenticación según el rol
const REDIRECT_ROUTES = {
  ADMINISTRADOR: '/admin',
  EMPLEADO: '/empleado',
  DEFAULT: '/empleado',
}

/**
 * Extrae el nombre del rol principal a partir del array de roles o authorities del JWT.
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
 * Hook que gestiona el estado y envío del formulario de inicio de sesión.
 */
export default function useLoginForm() {
  const navigate = useNavigate()

  // Estado de inputs del formulario
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Estado de carga y errores de validación/servidor
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({
    usuario: '',
    password: '',
  })

  // Validación local de campos requeridos
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

  // Redirecciona al panel correspondiente según el rol del usuario
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

  // Envía credenciales de autenticación al backend y almacena el JWT
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
          } else if (response.status === 429) {
            setError('Demasiados intentos fallidos. Intente nuevamente en 1 minuto.')
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
        
        if (!payload) {
          throw new Error('El token JWT recibido no es válido o no se pudo decodificar')
        }

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

  // Alterna la visibilidad del campo contraseña
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