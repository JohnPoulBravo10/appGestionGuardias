import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { decodeJwtPayload } from '../utils/authUtils'

const API_BASE_URL = 'http://localhost:8090'

/**
 * Hook para consultar y proveer los datos del empleado correspondiente al usuario autenticado.
 */
export default function useUsuarioActual() {
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)

  const [empleado, setEmpleado] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Mantiene la referencia actualizada de navigate sin disparar re-ejecuciones de efectos
  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  // Consulta el perfil del empleado al montar el hook
  useEffect(() => {
    const controller = new AbortController()

    const cargarDatosUsuario = async () => {
      try {
        setIsLoading(true)
        setError('')

        const token = localStorage.getItem('token')

        if (!token) {
          navigateRef.current('/login', {
            replace: true,
          })
          return
        }

        const payload = decodeJwtPayload(token)

        if (!payload) {
          throw new Error('Token JWT con formato inválido o no se pudo decodificar')
        }

        const usuarioId =
          payload.id || payload.usuarioId

        if (!usuarioId) {
          throw new Error(
            'El token no contiene el ID del usuario'
          )
        }

        const endpoint =
          `${API_BASE_URL}/api/empleados/por-usuario/${usuarioId}`

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          signal: controller.signal,
        })

        if (!response.ok) {
          // Si el token expiró o no está autorizado, limpiar sesión y redirigir a login
          if (
            response.status === 401 ||
            response.status === 403
          ) {
            console.warn('[USE_USUARIO_ACTUAL] Sesión expirada o token no autorizado (401/403). Redirigiendo a /login')
            localStorage.removeItem('token')

            navigateRef.current('/login', {
              replace: true,
            })

            return
          }

          if (response.status === 404) {
            throw new Error(
              `No existe un empleado asociado al usuario ${usuarioId}`
            )
          }

          throw new Error(
            `Error al obtener datos del empleado (${response.status})`
          )
        }

        const datosEmpleado =
          await response.json()

        console.info(
          `[USE_USUARIO_ACTUAL] Perfil cargado para usuario ID ${usuarioId} (DNI: ${datosEmpleado.dni})`
        )

        setEmpleado(datosEmpleado)
      } catch (err) {
        if (err.name === 'AbortError') {
          return
        }

        console.error(
          '[USE_USUARIO_ACTUAL] Error al cargar datos del usuario:',
          err
        )

        setError(
          err.message ||
            'Error desconocido al cargar el perfil'
        )
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    cargarDatosUsuario()

    return () => {
      controller.abort()
    }
  }, [])

  return {
    empleado,
    isLoading,
    error,
  }
}