import { useEffect, useState, useRef, useCallback } from 'react'

import {
  getEmpleadoIdFromToken,
  getToken,
  getRolFromToken,
} from '../../../utils/authUtils'

import '../common.css'

const API_BASE_URL = 'http://localhost:8090'

// Modal con la lista completa de notificaciones: combina notificaciones personales y por rol (para administradores) y permite marcarlas como leídas.
function ModalNotificaciones({ visible, onCerrar, onNotificacionLeida }) {
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const dialogRef = useRef(null)

  // Consulta notificaciones personales y globales por rol (si es admin) deduplicando por ID
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

      // Notificaciones personales
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

      // Si el usuario es administrador, consultar también notificaciones globales del rol
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

            const nuevasDeRol = listaRol.filter(
              (n) => !idsExistentes.has(n.id)
            )

            lista = [...lista, ...nuevasDeRol]
          }
        } catch (errRol) {
          console.error('[MODAL_NOTIFICACIONES] Error al obtener notificaciones por rol:', errRol)
        }
      }

      // Ordenar cronológicamente (más recientes primero)
      lista.sort((a, b) => {
        const fechaA = a.fechaCreacion ? new Date(a.fechaCreacion) : new Date(0)
        const fechaB = b.fechaCreacion ? new Date(b.fechaCreacion) : new Date(0)
        return fechaB - fechaA
      })

      setNotificaciones(lista)
    } catch (err) {
      console.error('[MODAL_NOTIFICACIONES] Error al cargar notificaciones en modal:', err)
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

  // Cierra con Escape y bloquea el desplazamiento del body
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

  // Marca una notificación como leída y dispara los eventos/callbacks de sincronización
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

      console.info(`[MODAL_NOTIFICACIONES] Notificación ID ${id} marcada como leída`)
      window.dispatchEvent(new CustomEvent('notificacion-leida'))

      if (onNotificacionLeida) {
        onNotificacionLeida()
      }
    } catch (err) {
      console.error('[MODAL_NOTIFICACIONES] Error al marcar notificación como leída:', err)
      setError('No se pudo marcar la notificación como leída.')
    }
  }

  // Formatea la fecha y hora de la notificación
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

  // Cierra el modal si se hace clic fuera del diálogo
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onCerrar()
    }
  }

  if (!visible) {
    return null
  }

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
