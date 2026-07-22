import { useState, useEffect } from 'react'

/**
 * URL base del API Gateway para llamadas al backend.
 * En desarrollo apunta a localhost:8090; en Docker se reemplaza por el hostname interno.
 */
const API_BASE_URL = 'http://localhost:8090'

/**
 * URL del frontend de login para redirigir cuando no hay sesión activa.
 */
const LOGIN_URL = 'http://localhost:5175'

/**
 * Decodifica el payload de un JWT sin verificar la firma.
 * Utilizado exclusivamente para lectura client-side de claims.
 *
 * @param {string} token - JWT completo (header.payload.signature)
 * @returns {Object} Claims decodificadas del payload
 * @throws {Error} Si el token tiene formato inválido
 */
function decodeJwtPayload(token) {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Token JWT con formato inválido')
  }
  const payloadBase64 = parts[1]
  const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
  return JSON.parse(payloadJson)
}

/**
 * Obtiene el JWT del query parameter de la URL o de localStorage.
 *
 * Prioridad:
 * 1. Query param "token" (puesto por el login al redirigir entre orígenes)
 * 2. localStorage (para recargas posteriores en el mismo origen)
 *
 * Si el token viene por URL, lo persiste en localStorage y limpia la URL
 * para no exponer el JWT en la barra de direcciones.
 *
 * @returns {string|null} JWT o null si no hay sesión
 */
function obtenerToken() {
  const urlParams = new URLSearchParams(window.location.search)
  const tokenFromUrl = urlParams.get('token')

  if (tokenFromUrl) {
    // Persistir en localStorage para recargas futuras
    localStorage.setItem('token', tokenFromUrl)

    // Limpiar el token de la URL sin recargar la página
    urlParams.delete('token')
    const nuevaUrl = urlParams.toString()
      ? `${window.location.pathname}?${urlParams.toString()}`
      : window.location.pathname
    window.history.replaceState({}, '', nuevaUrl)

    return tokenFromUrl
  }

  return localStorage.getItem('token')
}

/**
 * useUsuarioActual — Custom hook que obtiene la información del empleado autenticado.
 *
 * Flujo:
 * 1. Busca el JWT en la URL (redirect desde login) o en localStorage (recarga)
 * 2. Decodifica el payload para extraer el `id` (usuarioId)
 * 3. Llama a GET /api/empleados/por-usuario/{usuarioId} vía el API Gateway
 * 4. Retorna los datos del empleado, estado de carga y posibles errores
 *
 * Si no hay token válido, redirige al login automáticamente.
 *
 * @returns {{ empleado: Object|null, isLoading: boolean, error: string }}
 */
export default function useUsuarioActual() {
  const [empleado, setEmpleado] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        const token = obtenerToken()

        // Sin token → sesión no iniciada, redirigir al login
        if (!token) {
          window.location.href = LOGIN_URL
          return
        }

        const payload = decodeJwtPayload(token)
        const usuarioId = payload.id

        if (!usuarioId) {
          throw new Error('El token no contiene el ID del usuario')
        }

        const response = await fetch(
          `${API_BASE_URL}/api/empleados/por-usuario/${usuarioId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          }
        )

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            // Token expirado o inválido → redirigir al login
            localStorage.removeItem('token')
            window.location.href = LOGIN_URL
            return
          }
          throw new Error(`Error al obtener datos del empleado (${response.status})`)
        }

        const datosEmpleado = await response.json()
        setEmpleado(datosEmpleado)

      } catch (err) {
        console.error('Error al cargar datos del usuario:', err)
        setError(err.message || 'Error desconocido al cargar el perfil')
      } finally {
        setIsLoading(false)
      }
    }

    cargarDatosUsuario()
  }, [])

  return { empleado, isLoading, error }
}
