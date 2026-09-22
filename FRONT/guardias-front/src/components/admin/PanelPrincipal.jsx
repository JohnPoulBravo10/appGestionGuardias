import { useEffect, useState } from 'react'
import {
  getToken,
  getEmpleadoIdFromToken,
  getRolFromToken,
} from '../../utils/authUtils'

const API_BASE_URL = 'http://localhost:8090'

// Mapeo de roles a nombres descriptivos para la interfaz
const ETIQUETA_ROL = {
  ENFERMERIA: 'Enfermería',
  LIMPIEZA: 'Limpieza',
  MANTENIMIENTO: 'Mantenimiento',
  ADMINISTRADOR: 'Administración',
}

// Panel principal del administrador: tarjetas de resumen (guardias activas, solicitudes y notificaciones) y tabla en vivo.
function PanelPrincipal() {
  const [guardiasActivas, setGuardiasActivas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [solicitudesPendientes, setSolicitudesPendientes] = useState(0)
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true)

  const [cantidadNoLeidas, setCantidadNoLeidas] = useState(0)

  useEffect(() => {
    obtenerGuardiasActivas()
    obtenerSolicitudesPendientes()
    cargarNotificacionesNoLeidas()
  }, [])

  // Sincroniza el contador de notificaciones cuando se despacha el evento global 'notificacion-leida'
  useEffect(() => {
    const handleNotificacionLeida = () => {
      cargarNotificacionesNoLeidas()
    }

    window.addEventListener('notificacion-leida', handleNotificacionLeida)

    return () => {
      window.removeEventListener('notificacion-leida', handleNotificacionLeida)
    }
  }, [])

  // Consulta las guardias que se encuentran en curso en el momento actual
  const obtenerGuardiasActivas = async () => {
    try {
      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await fetch(`${API_BASE_URL}/api/guardias/activas`, { headers })

      if (!response.ok) {
        throw new Error('Error al obtener las guardias activas')
      }

      const data = await response.json()
      setGuardiasActivas(data)
    } catch (err) {
      console.error('Error al cargar guardias activas:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Obtiene la cantidad de solicitudes en estado PENDIENTE
  const obtenerSolicitudesPendientes = async () => {
    try {
      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await fetch(
        `${API_BASE_URL}/api/solicitudes/estado/PENDIENTE`,
        { headers }
      )

      if (!response.ok) {
        throw new Error(
          `Error al obtener solicitudes pendientes (${response.status})`
        )
      }

      const data = await response.json()
      setSolicitudesPendientes(Array.isArray(data) ? data.length : 0)
    } catch (err) {
      console.error('Error al cargar solicitudes pendientes:', err)
    } finally {
      setLoadingSolicitudes(false)
    }
  }

  // Cuenta notificaciones no leídas combinando personales y por rol (ADMINISTRADOR) deduplicadas por ID
  const cargarNotificacionesNoLeidas = async () => {
    try {
      const empleadoId = getEmpleadoIdFromToken()
      const token = getToken()

      if (!empleadoId || !token) {
        return
      }

      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      }

      // Notificaciones personales
      const responsePersonales = await fetch(
        `${API_BASE_URL}/api/notificaciones/empleado/${empleadoId}`,
        { method: 'GET', headers }
      )

      let lista = []

      if (responsePersonales.ok) {
        const dataPersonales = await responsePersonales.json()
        lista = Array.isArray(dataPersonales) ? dataPersonales : []
      }

      // Notificaciones globales del rol ADMINISTRADOR
      const rol = getRolFromToken()

      if (rol === 'ADMINISTRADOR') {
        try {
          const responseRol = await fetch(
            `${API_BASE_URL}/api/notificaciones/rol/${rol}`,
            { method: 'GET', headers }
          )

          if (responseRol.ok) {
            const dataRol = await responseRol.json()
            const listaRol = Array.isArray(dataRol) ? dataRol : []

            const idsExistentes = new Set(lista.map((n) => n.id))
            const nuevasDeRol = listaRol.filter((n) => !idsExistentes.has(n.id))
            lista = [...lista, ...nuevasDeRol]
          }
        } catch (errRol) {
          console.error('Error al obtener notificaciones por rol:', errRol)
        }
      }

      setCantidadNoLeidas(lista.filter((n) => !n.leida).length)
    } catch (err) {
      console.error('Error al cargar notificaciones no leídas:', err)
    }
  }

  const cantidadGuardiasActivas = guardiasActivas.length

  // Obtiene la etiqueta amigable del rol
  const formatearRol = (rol) => ETIQUETA_ROL[rol] ?? rol

  // Formatea horario a formato HH:MM
  const formatearHora = (hora) => {
    if (!hora) return '--:--'
    return hora.substring(0, 5)
  }

  return (
    <div className="admin-panel-principal">
      <h2 className="admin-panel-titulo">Panel Principal</h2>

      {/* ── Tarjetas de resumen ── */}
      <div className="admin-panel-tarjetas">
        <div className="admin-panel-tarjeta">
          <span className="admin-tarjeta-label">Guardias activas</span>
          <div className="admin-tarjeta-contenido">
            <span className="admin-tarjeta-valor">
              {loading ? '…' : cantidadGuardiasActivas}
            </span>
            <span className="admin-tarjeta-icono" aria-hidden="true">
              {/* Icono de escudo */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
          </div>
        </div>

        <div className="admin-panel-tarjeta">
          <span className="admin-tarjeta-label">Solicitudes pendientes</span>
          <div className="admin-tarjeta-contenido">
            <span className="admin-tarjeta-valor">
              {loadingSolicitudes ? '…' : solicitudesPendientes}
            </span>
            <span className="admin-tarjeta-icono" aria-hidden="true">
              {/* Icono de flechas intercambio */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            </span>
          </div>
        </div>

        <div className="admin-panel-tarjeta">
          <span className="admin-tarjeta-label">Notificaciones no leidas</span>
          <div className="admin-tarjeta-contenido">
            <span className="admin-tarjeta-valor">
              {loading ? '…' : cantidadNoLeidas}
            </span>
            <span className="admin-tarjeta-icono" aria-hidden="true">
              {/* Icono de campana */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabla de guardias activas ── */}
      <div className="admin-panel-tabla-container">
        <h3 className="admin-panel-tabla-titulo">Guardias Activas</h3>

        {loading && <p className="admin-panel-cargando">Cargando guardias…</p>}

        {!loading && error && (
          <p className="admin-panel-error">No se pudieron cargar las guardias.</p>
        )}

        {!loading && !error && guardiasActivas.length === 0 && (
          <p className="admin-panel-vacio">
            No hay guardias activas en este momento.
          </p>
        )}

        {!loading && !error && guardiasActivas.length > 0 && (
          <table className="admin-tabla-guardias admin-panel-tabla">
            <thead>
              <tr>
                <th>Horario</th>
                <th>Área</th>
                <th>Personal</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {guardiasActivas.map((g) => (
                <tr key={g.id}>
                  <td>
                    {formatearHora(g.horaInicio)} a{' '}
                    {formatearHora(g.horaFin)}
                  </td>
                  <td>{formatearRol(g.rol)}</td>
                  <td>{g.empleadoNombre}</td>
                  <td>
                    <span className="admin-badge admin-badge-encurso">
                      En curso
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default PanelPrincipal
