import { useEffect, useState } from 'react'
import { getToken } from '../../utils/authUtils'

/**
 * Mapeo de roles internos a etiquetas legibles para el usuario.
 */
const ETIQUETA_ROL = {
  ENFERMERIA: 'Enfermería',
  LIMPIEZA: 'Limpieza',
  MANTENIMIENTO: 'Mantenimiento',
  ADMINISTRADOR: 'Administración',
}

/**
 * Panel principal del administrador (sección "Inicio").
 *
 * Muestra:
 * - Tarjeta "Guardias Activas": recuento de guardias sucediendo ahora.
 * - Tarjeta "Personal de turno": empleados asignados a esas guardias activas.
 * - Tarjeta "Solicitudes Pendientes": recuento real obtenido del solicitudes-service.
 * - Tabla con el detalle de las guardias activas.
 */
function PanelPrincipal() {
  const [guardiasActivas, setGuardiasActivas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /** Cantidad real de solicitudes pendientes obtenida del servicio */
  const [solicitudesPendientes, setSolicitudesPendientes] = useState(0)
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true)

  /** Lista de empleados para resolver nombres en la tabla de guardias */
  const [empleados, setEmpleados] = useState([])

  useEffect(() => {
    obtenerGuardiasActivas()
    obtenerSolicitudesPendientes()
    obtenerEmpleados()
  }, [])

  const obtenerGuardiasActivas = async () => {
    try {
      const response = await fetch('http://localhost:8090/api/guardias/activas')

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

  /**
   * Consulta al solicitudes-service la lista de solicitudes con estado
   * PENDIENTE y almacena el recuento en el estado local.
   */
  const obtenerSolicitudesPendientes = async () => {
    try {
      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await fetch(
        'http://localhost:8090/api/solicitudes/estado/PENDIENTE',
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
      // En caso de fallo, se deja el contador en 0 para no bloquear el panel.
    } finally {
      setLoadingSolicitudes(false)
    }
  }

  /**
   * Carga la lista completa de empleados para resolver
   * el nombre asociado a cada empleadoId de las guardias.
   */
  const obtenerEmpleados = async () => {
    try {
      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await fetch(
        'http://localhost:8090/api/empleados',
        { headers }
      )

      if (!response.ok) {
        throw new Error(`Error al obtener empleados (${response.status})`)
      }

      const data = await response.json()
      setEmpleados(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error al cargar empleados:', err)
    }
  }

  /** Cantidad de guardias activas en este momento */
  const cantidadGuardiasActivas = guardiasActivas.length

  /** Empleados asignados a guardias activas (solo los no nulos) */
  const personalDeTurno = guardiasActivas.filter(
    (g) => g.empleadoId !== null && g.empleadoId !== undefined
  ).length

  /**
   * Mapa de empleadoId (dni) → nombre completo para resolución O(1).
   * Se recalcula cuando cambia la lista de empleados.
   */
  const mapaEmpleados = new Map(
    empleados.map((e) => [e.dni, `${e.nombre} ${e.apellido}`])
  )

  /**
   * Resuelve el nombre del empleado a partir de su ID (dni).
   * Si no se encuentra en el mapa, muestra un fallback con el ID.
   */
  const resolverNombreEmpleado = (empleadoId) =>
    mapaEmpleados.get(empleadoId) ?? `Empleado #${empleadoId}`

  /**
   * Formatea el nombre del rol para mostrarlo de forma legible.
   * Si no existe en el mapeo, devuelve el valor original capitalizado.
   */
  const formatearRol = (rol) => ETIQUETA_ROL[rol] ?? rol

  /**
   * Formatea "HH:MM:SS" o "HH:MM" a "HH:MM" para mostrar en la tabla.
   */
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
          <span className="admin-tarjeta-label">Personal de turno</span>
          <div className="admin-tarjeta-contenido">
            <span className="admin-tarjeta-valor">
              {loading ? '…' : personalDeTurno}
            </span>
            <span className="admin-tarjeta-icono" aria-hidden="true">
              {/* Icono de personas */}
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
                  <td>
                    {g.empleadoId != null
                      ? resolverNombreEmpleado(g.empleadoId)
                      : 'Sin asignar'}
                  </td>
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
