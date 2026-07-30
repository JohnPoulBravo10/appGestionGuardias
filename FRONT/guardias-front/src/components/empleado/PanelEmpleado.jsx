import { useEffect, useState } from 'react'

import {
  getEmpleadoIdFromToken,
  getToken,
} from '../../utils/authUtils'

const API_BASE_URL = 'http://localhost:8090'

/**
 * Mapeo de roles internos a etiquetas legibles para el usuario.
 * Centraliza las traducciones y evita lógica dispersa.
 */
const ETIQUETA_ROL = {
  ENFERMERIA: 'Enfermería',
  LIMPIEZA: 'Limpieza',
  MANTENIMIENTO: 'Mantenimiento',
  ADMINISTRADOR: 'Administración',
}

/**
 * Panel principal del empleado (sección "Inicio").
 *
 * Muestra:
 * - Tarjeta "Próxima Guardia": la guardia más cercana asignada al empleado.
 * - Tarjeta "Horas este mes": horas trabajadas en el mes actual (estado COMPLETADA).
 * - Tarjeta "Solicitudes Activas": valor fijo (servicio pendiente de implementar).
 * - Sección de notificaciones recientes (placeholder hasta implementar el servicio).
 */
function PanelEmpleado() {
  const [guardias, setGuardias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarGuardiasEmpleado()
  }, [])

  /**
   * Obtiene todas las guardias asignadas al empleado autenticado.
   * A partir de ellas se derivan la próxima guardia y las horas del mes.
   */
  const cargarGuardiasEmpleado = async () => {
    try {
      setLoading(true)
      setError(null)

      const empleadoId = getEmpleadoIdFromToken()

      if (!empleadoId) {
        throw new Error(
          'No se pudo identificar al empleado autenticado.'
        )
      }

      const token = getToken()

      if (!token) {
        throw new Error('No hay una sesión iniciada.')
      }

      const response = await fetch(
        `${API_BASE_URL}/api/guardias/empleado/${empleadoId}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          `Error al obtener guardias (${response.status})`
        )
      }

      const data = await response.json()

      setGuardias(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(
        'Error al cargar guardias del empleado:',
        err
      )
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Calcula la próxima guardia futura del empleado.
   * Filtra guardias cuya fecha sea igual o posterior a hoy y ordena por fecha + hora.
   * Devuelve null si no hay guardias futuras.
   */
  const calcularProximaGuardia = () => {
    const ahora = new Date()
    const hoy = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate()
    )

    const futuras = guardias
      .filter((g) => {
        if (!g.fecha) return false

        const fechaGuardia = new Date(g.fecha + 'T00:00:00')

        return fechaGuardia >= hoy
      })
      .sort((a, b) => {
        const fechaA = new Date(a.fecha + 'T' + (a.horaInicio || '00:00'))
        const fechaB = new Date(b.fecha + 'T' + (b.horaInicio || '00:00'))

        return fechaA - fechaB
      })

    return futuras.length > 0 ? futuras[0] : null
  }

  /**
   * Calcula las horas trabajadas en el mes actual.
   * Solo cuenta guardias con estado COMPLETADA cuya fecha esté en el mes corriente.
   */
  const calcularHorasMesActual = () => {
    const ahora = new Date()
    const mesActual = ahora.getMonth()
    const anioActual = ahora.getFullYear()

    return guardias
      .filter((g) => {
        if (!g.fecha || g.estado !== 'COMPLETADA') {
          return false
        }

        const fechaGuardia = new Date(g.fecha + 'T00:00:00')

        return (
          fechaGuardia.getMonth() === mesActual &&
          fechaGuardia.getFullYear() === anioActual
        )
      })
      .reduce((total, g) => {
        if (!g.horaInicio || !g.horaFin) return total

        const [hIni, mIni] = g.horaInicio.split(':').map(Number)
        const [hFin, mFin] = g.horaFin.split(':').map(Number)

        const minutosInicio = hIni * 60 + mIni
        const minutosFin = hFin * 60 + mFin

        /* Si la hora de fin es menor, asumimos que la guardia cruza la medianoche */
        const diferencia =
          minutosFin >= minutosInicio
            ? minutosFin - minutosInicio
            : 1440 - minutosInicio + minutosFin

        return total + diferencia / 60
      }, 0)
  }

  /**
   * Formatea el nombre del rol para mostrarlo de forma legible.
   * Si no existe en el mapeo, devuelve el valor original capitalizado.
   */
  const formatearRol = (rol) => ETIQUETA_ROL[rol] ?? rol

  /**
   * Formatea "HH:MM:SS" o "HH:MM" a "HH:MM" para mostrar en las tarjetas.
   */
  const formatearHora = (hora) => {
    if (!hora) return '--:--'
    return hora.substring(0, 5)
  }

  /**
   * Devuelve una etiqueta relativa para la fecha de la próxima guardia
   * (e.g. "HOY", "MAÑANA", o la fecha formateada).
   */
  const formatearFechaRelativa = (fechaStr) => {
    if (!fechaStr) return ''

    const ahora = new Date()
    const hoy = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate()
    )

    const fecha = new Date(fechaStr + 'T00:00:00')

    const diffMs = fecha - hoy
    const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (diffDias === 0) return 'HOY'
    if (diffDias === 1) return 'MAÑANA'

    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
    })
  }

  /** Solicitudes activas — hardcodeado hasta implementar el servicio */
  const SOLICITUDES_ACTIVAS = 0

  const proximaGuardia = loading ? null : calcularProximaGuardia()
  const horasMes = loading ? 0 : calcularHorasMesActual()

  return (
    <div className="empleado-panel-principal">
      <h2 className="empleado-panel-titulo">Mi Resumen</h2>

      {/* ── Tarjetas de resumen ── */}
      <div className="empleado-panel-tarjetas">
        {/* Próxima Guardia */}
        <div className="empleado-panel-tarjeta">
          <span className="empleado-tarjeta-label">Próxima guardia</span>
          <div className="empleado-tarjeta-contenido">
            {loading ? (
              <span className="empleado-tarjeta-cargando">
                Cargando…
              </span>
            ) : proximaGuardia ? (
              <div className="empleado-proxima-guardia-info">
                <span className="empleado-proxima-guardia-horario">
                  {formatearFechaRelativa(proximaGuardia.fecha)},{' '}
                  {formatearHora(proximaGuardia.horaInicio)} h
                </span>
                <span className="empleado-proxima-guardia-area">
                  {formatearRol(proximaGuardia.rol)}
                </span>
              </div>
            ) : (
              <span className="empleado-tarjeta-sin-datos">
                Sin guardias asignadas
              </span>
            )}
            <span className="empleado-tarjeta-icono" aria-hidden="true">
              {/* Icono de reloj */}
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
          </div>
        </div>

        {/* Horas este mes */}
        <div className="empleado-panel-tarjeta">
          <span className="empleado-tarjeta-label">Horas este mes</span>
          <div className="empleado-tarjeta-contenido">
            <span className="empleado-tarjeta-valor">
              {loading ? '…' : `${Math.round(horasMes)} h`}
            </span>
            <span className="empleado-tarjeta-icono" aria-hidden="true">
              {/* Icono de calendario */}
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
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
          </div>
        </div>

        {/* Solicitudes Activas */}
        <div className="empleado-panel-tarjeta">
          <span className="empleado-tarjeta-label">Solicitudes activas</span>
          <div className="empleado-tarjeta-contenido">
            <span className="empleado-tarjeta-valor">
              {SOLICITUDES_ACTIVAS}
            </span>
            <span className="empleado-tarjeta-icono" aria-hidden="true">
              {/* Icono de documento/solicitud */}
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
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="8" y1="8" x2="16" y2="8" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="8" y1="16" x2="12" y2="16" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* ── Notificaciones recientes ── */}
      <div className="empleado-panel-tabla-container">
        <h3 className="empleado-panel-tabla-titulo">
          Mis notificaciones recientes
        </h3>

        {error && (
          <p className="empleado-panel-error">
            No se pudieron cargar los datos del panel.
          </p>
        )}

        <p className="empleado-panel-vacio">
          No hay notificaciones por el momento.
        </p>
      </div>
    </div>
  )
}

export default PanelEmpleado
