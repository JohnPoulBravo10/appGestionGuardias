import { useEffect, useState } from 'react'

import {
  getEmpleadoIdFromToken,
  getToken,
} from '../../utils/authUtils'

const API_BASE_URL = 'http://localhost:8090'

const ETIQUETA_ROL = {
  ENFERMERIA: 'Enfermería',
  LIMPIEZA: 'Limpieza',
  MANTENIMIENTO: 'Mantenimiento',
  ADMINISTRADOR: 'Administración',
}

function PanelEmpleado() {

  const [guardias, setGuardias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [notificaciones, setNotificaciones] = useState([])
  const [loadingNotificaciones, setLoadingNotificaciones] = useState(true)
  const [errorNotificaciones, setErrorNotificaciones] = useState(null)

  useEffect(() => {
    cargarGuardiasEmpleado()
    cargarNotificacionesEmpleado()
  }, [])

  // Escuchar cuando otro componente (ej: ModalNotificaciones)
  // marca una notificación como leída, para sincronizar la lista
  useEffect(() => {

    const handleNotificacionLeida = () => {
      cargarNotificacionesEmpleado()
    }

    window.addEventListener('notificacion-leida', handleNotificacionLeida)

    return () => {
      window.removeEventListener('notificacion-leida', handleNotificacionLeida)
    }
  }, [])

  const cargarGuardiasEmpleado = async () => {

    try {

      setLoading(true)
      setError(null)

      const empleadoId = getEmpleadoIdFromToken()

      if (!empleadoId) {
        throw new Error('No se pudo identificar al empleado autenticado.')
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
        throw new Error(`Error al obtener guardias (${response.status})`)
      }

      const data = await response.json()

      setGuardias(Array.isArray(data) ? data : [])

    } catch (err) {

      console.error('Error al cargar guardias del empleado:', err)
      setError(err.message)

    } finally {

      setLoading(false)
    }
  }

  const cargarNotificacionesEmpleado = async () => {

    try {

      setLoadingNotificaciones(true)
      setErrorNotificaciones(null)

      const empleadoId = getEmpleadoIdFromToken()

      if (!empleadoId) {
        throw new Error('No se pudo identificar al empleado autenticado.')
      }

      const token = getToken()

      if (!token) {
        throw new Error('No hay una sesión iniciada.')
      }

      const response = await fetch(
        `${API_BASE_URL}/api/notificaciones/empleado/${empleadoId}`,
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
          `Error al obtener notificaciones (${response.status})`
        )
      }

      const data = await response.json()

      const lista = Array.isArray(data) ? data : []

      // Ordenar por fecha de creación descendente (más recientes primero)
      lista.sort((a, b) => {
        const fechaA = a.fechaCreacion ? new Date(a.fechaCreacion) : new Date(0)
        const fechaB = b.fechaCreacion ? new Date(b.fechaCreacion) : new Date(0)
        return fechaB - fechaA
      })

      setNotificaciones(lista)

    } catch (err) {

      console.error('Error al cargar notificaciones:', err)
      setErrorNotificaciones(err.message)

    } finally {

      setLoadingNotificaciones(false)
    }
  }

  const marcarComoLeida = async (id) => {

    try {

      const token = getToken()

      if (!token) {
        throw new Error('No hay una sesión iniciada.')
      }

      const response = await fetch(
        `${API_BASE_URL}/api/notificaciones/${id}/leida`,
        {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          `No se pudo marcar la notificación como leída (${response.status})`
        )
      }

      const notificacionActualizada = await response.json()

      setNotificaciones((notificacionesActuales) =>
        notificacionesActuales.map((notificacion) =>
          notificacion.id === id
            ? notificacionActualizada
            : notificacion
        )
      )

      // Notificar a otros componentes (ej: BarraSuperior) para
      // que sincronicen el indicador de notificaciones no leídas
      window.dispatchEvent(new CustomEvent('notificacion-leida'))

    } catch (err) {

      console.error('Error al marcar notificación como leída:', err)
      setErrorNotificaciones('No se pudo marcar la notificación como leída.')
    }
  }

  const calcularProximaGuardia = () => {

    const ahora = new Date()

    const hoy = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate()
    )

    const futuras = guardias
      .filter((g) => {

        if (!g.fecha || g.estado === 'COMPLETADA') {
          return false
        }

        const fechaGuardia = new Date(g.fecha + 'T00:00:00')

        return fechaGuardia >= hoy
      })
      .sort((a, b) => {

        const fechaA = new Date(
          a.fecha + 'T' + (a.horaInicio || '00:00')
        )

        const fechaB = new Date(
          b.fecha + 'T' + (b.horaInicio || '00:00')
        )

        return fechaA - fechaB
      })

    return futuras.length > 0 ? futuras[0] : null
  }

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

        if (!g.horaInicio || !g.horaFin) {
          return total
        }

        const [hIni, mIni] = g.horaInicio.split(':').map(Number)
        const [hFin, mFin] = g.horaFin.split(':').map(Number)

        const minutosInicio = hIni * 60 + mIni
        const minutosFin = hFin * 60 + mFin

        const diferencia =
          minutosFin >= minutosInicio
            ? minutosFin - minutosInicio
            : 1440 - minutosInicio + minutosFin

        return total + diferencia / 60

      }, 0)
  }

  const formatearRol = (rol) => {
    return ETIQUETA_ROL[rol] ?? rol
  }

  const formatearHora = (hora) => {

    if (!hora) {
      return '--:--'
    }

    return hora.substring(0, 5)
  }

  const formatearFechaRelativa = (fechaStr) => {

    if (!fechaStr) {
      return ''
    }

    const ahora = new Date()

    const hoy = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate()
    )

    const fecha = new Date(fechaStr + 'T00:00:00')

    const diffMs = fecha - hoy
    const diffDias = Math.round(
      diffMs / (1000 * 60 * 60 * 24)
    )

    if (diffDias === 0) {
      return 'HOY'
    }

    if (diffDias === 1) {
      return 'MAÑANA'
    }

    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
    })
  }

  const formatearFechaNotificacion = (fecha) => {

    if (!fecha) {
      return ''
    }

    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const SOLICITUDES_ACTIVAS = 0

  const proximaGuardia = loading
    ? null
    : calcularProximaGuardia()

  const horasMes = loading
    ? 0
    : calcularHorasMesActual()

  const cantidadNoLeidas = notificaciones.filter(
    (notificacion) => !notificacion.leida
  ).length

  return (
    <div className="empleado-panel-principal">

      <h2 className="empleado-panel-titulo">
        Mi Resumen
      </h2>

      <div className="empleado-panel-tarjetas">

        <div className="empleado-panel-tarjeta">

          <span className="empleado-tarjeta-label">
            Próxima guardia
          </span>

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
                  {proximaGuardia.estado === 'ENCURSO' && ' (En curso)'}
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

            <span
              className="empleado-tarjeta-icono"
              aria-hidden="true"
            >
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

        <div className="empleado-panel-tarjeta">

          <span className="empleado-tarjeta-label">
            Horas este mes
          </span>

          <div className="empleado-tarjeta-contenido">

            <span className="empleado-tarjeta-valor">
              {loading
                ? '…'
                : `${Math.round(horasMes)} h`}
            </span>

            <span
              className="empleado-tarjeta-icono"
              aria-hidden="true"
            >
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
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  ry="2"
                />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>

          </div>
        </div>

        <div className="empleado-panel-tarjeta">

          <span className="empleado-tarjeta-label">
            Solicitudes activas
          </span>

          <div className="empleado-tarjeta-contenido">

            <span className="empleado-tarjeta-valor">
              {SOLICITUDES_ACTIVAS}
            </span>

            <span
              className="empleado-tarjeta-icono"
              aria-hidden="true"
            >
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
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                  ry="2"
                />
                <line x1="8" y1="8" x2="16" y2="8" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="8" y1="16" x2="12" y2="16" />
              </svg>
            </span>

          </div>
        </div>

      </div>

      <div className="empleado-panel-tabla-container">

        <div className="empleado-notificaciones-header">

          <div>

            <h3 className="empleado-panel-tabla-titulo">
              Notificaciones no leídas
            </h3>

            <p className="empleado-notificaciones-subtitulo">
              Notificaciones pendientes de lectura
            </p>

          </div>

          {!loadingNotificaciones && cantidadNoLeidas > 0 && (
            <span className="empleado-notificaciones-contador">
              {cantidadNoLeidas}{' '}
              {cantidadNoLeidas === 1
                ? 'no leída'
                : 'no leídas'}
            </span>
          )}

        </div>

        {loadingNotificaciones ? (

          <p className="empleado-panel-vacio">
            Cargando notificaciones...
          </p>

        ) : errorNotificaciones ? (

          <p className="empleado-panel-error">
            {errorNotificaciones}
          </p>

        ) : notificaciones.filter((n) => !n.leida).length === 0 ? (

          <p className="empleado-panel-vacio">
            No hay notificaciones sin leer.
          </p>

        ) : (

          <div className="empleado-notificaciones-lista">

            {notificaciones.filter((n) => !n.leida).map((notificacion) => (

              <div
                key={notificacion.id}
                className={`empleado-notificacion-item ${!notificacion.leida
                  ? 'empleado-notificacion-item-nueva'
                  : ''
                  }`}
              >

                <div className="empleado-notificacion-principal">

                  {!notificacion.leida && (
                    <span className="empleado-notificacion-punto" />
                  )}

                  <div className="empleado-notificacion-texto">

                    <strong className="empleado-notificacion-titulo">
                      {notificacion.titulo}
                    </strong>

                    <span className="empleado-notificacion-mensaje">
                      {notificacion.mensaje}
                    </span>

                  </div>

                </div>

                <div className="empleado-notificacion-fecha">
                  {formatearFechaNotificacion(
                    notificacion.fechaCreacion
                  )}
                </div>

                <div>

                  <span
                    className={
                      notificacion.leida
                        ? 'empleado-notificacion-estado empleado-notificacion-estado-leida'
                        : 'empleado-notificacion-estado empleado-notificacion-estado-nueva'
                    }
                  >
                    {notificacion.leida
                      ? 'Leída'
                      : 'Nueva'}
                  </span>

                </div>

                <div className="empleado-notificacion-accion">

                  {!notificacion.leida ? (

                    <button
                      type="button"
                      className="empleado-btn-marcar-leida"
                      onClick={() =>
                        marcarComoLeida(notificacion.id)
                      }
                    >
                      Marcar leída
                    </button>

                  ) : (

                    <span className="empleado-notificacion-sin-accion">
                      —
                    </span>

                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  )
}

export default PanelEmpleado