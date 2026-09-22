import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { decodeJwtPayload } from '../utils/authUtils'

const API_BASE_URL = 'http://localhost:8090'


export default function useUsuarioActual() {
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)

  const [empleado, setEmpleado] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  /*
   * Conservamos siempre la versión actual de navigate,
   * pero sin volver a ejecutar la consulta.
   */
  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  /*
   * Este efecto se ejecuta una sola vez cuando se monta
   * la barra lateral.
   */
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
          if (
            response.status === 401 ||
            response.status === 403
          ) {
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

        setEmpleado(datosEmpleado)
      } catch (err) {
        if (err.name === 'AbortError') {
          return
        }

        console.error(
          'Error al cargar datos del usuario:',
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