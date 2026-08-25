import { useEffect, useState, useRef, useCallback } from 'react'

import {
  getEmpleadoIdFromToken,
  getToken,
  getRolFromToken,
} from '../../../utils/authUtils'

import '../common.css'

const API_BASE_URL = 'http://localhost:8090'

/**
 * Modal que muestra la lista completa y navegable de notificaciones
 * del usuario autenticado.
 *
 * Se reutiliza la misma estética de notificaciones de PanelEmpleado
 * (clases empleado-notificacion-*) para mantener consistencia visual.
 *
 * Si el usuario es ADMINISTRADOR, también recupera las notificaciones
 * dirigidas al rol (endpoint /api/notificaciones/rol/{rol}) y las
 * combina con las personales, deduplicando por id.
 *
 * @param {boolean}  visible               - Controla la visibilidad del modal.
 * @param {Function} onCerrar              - Callback para cerrar el modal.
 * @param {Function} onNotificacionLeida   - Callback que se dispara al marcar
 *                                           una notificación como leída, para
 *                                           que el componente padre actualice
 *                                           indicadores (ej: punto blanco).
 */
function ModalNotificaciones({ visible, onCerrar, onNotificacionLeida }) {

  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const dialogRef = useRef(null)

  // ── Carga de notificaciones al abrir el modal ──

  const cargarNotificaciones = useCallback(async () => {

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

      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      }

      // Obtener notificaciones personales del empleado
      const responsePersonales = await fetch(
        `${API_BASE_URL}/api/notificaciones/empleado/${empleadoId}`,
        { method: 'GET', headers }
      )

      if (!responsePersonales.ok) {
        throw new Error(
          `Error al obtener notificaciones (${responsePersonales.status})`
        )
      }

      const dataPersonales = await responsePersonales.json()
      let lista = Array.isArray(dataPersonales) ? dataPersonales : []

      // Si el usuario es administrador, recuperar también
      // las notificaciones dirigidas al rol ADMINISTRADOR
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

            // Combinar deduplicando por id
            const idsExistentes = new Set(lista.map((n) => n.id))

            const nuevasDeRol = listaRol.filter(
              (n) => !idsExistentes.has(n.id)
            )

            lista = [...lista, ...nuevasDeRol]
          }

        } catch (errRol) {
          // No interrumpir si falla la consulta por rol;
          // las notificaciones personales siguen disponibles.
          console.error('Error al obtener notificaciones por rol:', errRol)
        }
      }

      // Ordenar por fecha de creación descendente (más recientes primero)
      lista.sort((a, b) => {
        const fechaA = a.fechaCreacion ? new Date(a.fechaCreacion) : new Date(0)
        const fechaB = b.fechaCreacion ? new Date(b.fechaCreacion) : new Date(0)
        return fechaB - fechaA
      })

      setNotificaciones(lista)

    } catch (err) {

      console.error('Error al cargar notificaciones en modal:', err)
      setError(err.message)

    } finally {

      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (visible) {
      cargarNotificaciones()
    }
  }, [visible, cargarNotificaciones])

  // ── Cierre con Escape y bloqueo de scroll ──

  useEffect(() => {
    if (!visible) {
      return
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCerrar()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [visible, onCerrar])

  // ── Marcar notificación como leída ──

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

      setNotificaciones((actuales) =>
        actuales.map((notificacion) =>
          notificacion.id === id
            ? notificacionActualizada
            : notificacion
        )
      )

      // Notificar a otros componentes (ej: PanelEmpleado) para
      // que sincronicen su lista de notificaciones
      window.dispatchEvent(new CustomEvent('notificacion-leida'))

      // Notificar al padre para que actualice el indicador
      if (onNotificacionLeida) {
        onNotificacionLeida()
      }

    } catch (err) {

      console.error('Error al marcar notificación como leída:', err)
      setError('No se pudo marcar la notificación como leída.')
    }
  }

  // ── Formato de fecha ──

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

  // ── Cierre al hacer click en el overlay ──

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onCerrar()
    }
  }

  if (!visible) {
    return null
  }

  // Calcular cantidad de no leídas para el badge del header
  const cantidadNoLeidas = notificaciones.filter(
    (n) => !n.leida
  ).length

  return (
    <div
      className="common-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        className="common-modal-dialogo-notificaciones"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-notificaciones"
      >

        {/* ── Header del modal ── */}

        <div className="common-modal-notif-header">

          <div>

            <h3
              id="titulo-modal-notificaciones"
              className="common-modal-titulo"
              style={{ marginBottom: '4px' }}
            >
              Notificaciones
            </h3>

            <p className="empleado-notificaciones-subtitulo">
              Historial completo de notificaciones
            </p>

          </div>

          <div className="common-modal-notif-header-acciones">

            {!loading && cantidadNoLeidas > 0 && (
              <span className="empleado-notificaciones-contador">
                {cantidadNoLeidas}{' '}
                {cantidadNoLeidas === 1 ? 'no leída' : 'no leídas'}
              </span>
            )}

            <button
              type="button"
              className="common-modal-notif-btn-cerrar"
              onClick={onCerrar}
              aria-label="Cerrar notificaciones"
            >
              ✕
            </button>

          </div>

        </div>

        {/* ── Contenido scrollable ── */}

        <div className="common-modal-notif-cuerpo">

          {loading ? (

            <p className="empleado-panel-vacio">
              Cargando notificaciones...
            </p>

          ) : error ? (

            <p className="empleado-panel-error">
              {error}
            </p>

          ) : notificaciones.length === 0 ? (

            <p className="empleado-panel-vacio">
              No hay notificaciones por el momento.
            </p>

          ) : (

            <div className="empleado-notificaciones-lista">

              {notificaciones.map((notificacion) => (

                <div
                  key={notificacion.id}
                  className={`empleado-notificacion-item ${
                    !notificacion.leida
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
    </div>
  )
}

export default ModalNotificaciones
