import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getEmpleadoIdFromToken,
  getToken,
} from '../../utils/authUtils'

const API_BASE_URL = 'http://localhost:8090'

/**
 * Pantalla "Mis Guardias" del módulo empleado.
 *
 * Muestra la tabla de guardias asignadas al empleado autenticado
 * con una columna "Acciones" que permite solicitar un cambio de guardia.
 * Si ya existe una solicitud PENDIENTE para una guardia, el botón
 * se deshabilita y muestra "Solicitud realizada".
 */
function MisGuardias() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [guardias, setGuardias] = useState([])
  const [error, setError] = useState('')

  /**
   * IDs de guardias que ya tienen una solicitud PENDIENTE.
   * Se usa un Set para búsquedas O(1) al renderizar cada fila.
   */
  const [guardiasConSolicitud, setGuardiasConSolicitud] =
    useState(new Set())

  /**
   * Obtiene las solicitudes pendientes del empleado autenticado
   * y extrae los guardiaId para saber qué guardias ya tienen solicitud.
   */
  const obtenerSolicitudesPendientes = useCallback(
    async (empleadoDni) => {
      try {
        const token = getToken()

        if (!token) return

        const response = await fetch(
          `${API_BASE_URL}/api/solicitudes/empleado/${empleadoDni}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) return

        const data = await response.json()

        if (!Array.isArray(data)) return

        /*
         * Filtramos solo las solicitudes con estado PENDIENTE
         * y extraemos el guardiaId del subdocumento infoGuardia.
         */
        const ids = new Set(
          data
            .filter(
              (solicitud) =>
                solicitud.estado === 'PENDIENTE' &&
                solicitud.infoGuardia?.guardiaId != null
            )
            .map((solicitud) =>
              Number(solicitud.infoGuardia.guardiaId)
            )
        )

        setGuardiasConSolicitud(ids)
      } catch (err) {
        /* Fallo silencioso: los botones quedarán habilitados */
        console.error(
          'Error al obtener solicitudes pendientes:',
          err
        )
      }
    },
    []
  )

  useEffect(() => {
    const empleadoId = getEmpleadoIdFromToken()

    if (!empleadoId) {
      setError(
        'No se pudo identificar al empleado autenticado.'
      )
      setLoading(false)
      return
    }

    obtenerGuardias(empleadoId)
    obtenerSolicitudesPendientes(empleadoId)
  }, [obtenerSolicitudesPendientes])

  const obtenerGuardias = async (empleadoId) => {
    setLoading(true)
    setError('')

    try {
      const token = getToken()

      if (!token) {
        throw new Error(
          'No hay una sesión iniciada.'
        )
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
        if (response.status === 401) {
          throw new Error(
            'Tu sesión no es válida o expiró.'
          )
        }

        if (response.status === 403) {
          throw new Error(
            'No tenés permisos para consultar estas guardias.'
          )
        }

        if (response.status === 404) {
          throw new Error(
            'No se encontró el empleado autenticado.'
          )
        }

        throw new Error(
          `Error al obtener guardias (${response.status}).`
        )
      }

      const data = await response.json()

      setGuardias(
        Array.isArray(data) ? data : []
      )
    } catch (fetchError) {
      console.error(
        'Error al obtener guardias:',
        fetchError
      )

      setError(
        fetchError.message ||
          'Ocurrió un error al cargar las guardias.'
      )
    } finally {
      setLoading(false)
    }
  }

  /**
   * Determina si una guardia ya tiene una solicitud pendiente.
   * @param {number|string} guardiaId — ID de la guardia
   * @returns {boolean}
   */
  const tieneSolicitudPendiente = (guardiaId) =>
    guardiasConSolicitud.has(Number(guardiaId))

  /**
   * Navega a la pantalla de solicitud de cambio,
   * pasando el ID de la guardia como state de navegación
   * para que el formulario la pre-seleccione automáticamente.
   *
   * @param {number|string} guardiaId — ID de la guardia seleccionada
   */
  const solicitarCambio = (guardiaId) => {
    navigate('/empleado/solicitar-cambio', {
      state: { guardiaId: String(guardiaId) },
    })
  }

  return (
    <div className="empleado-tabla-container">
      <h3 style={{ marginBottom: '20px' }}>
        MIS GUARDIAS
      </h3>

      {loading && (
        <p>Cargando guardias...</p>
      )}

      {!loading && error && (
        <p className="empleado-mensaje-error">
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        guardias.length === 0 && (
          <p>No tenés guardias asignadas.</p>
        )}

      {!loading &&
        !error &&
        guardias.length > 0 && (
          <table className="empleado-tabla-guardias">
            <thead>
              <tr>
                <th>FECHA</th>
                <th>HORARIO</th>
                <th>ÁREA</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>

            <tbody>
              {guardias.map((guardia) => {
                const pendiente =
                  tieneSolicitudPendiente(guardia.id)

                return (
                  <tr key={guardia.id}>
                    <td>{guardia.fecha}</td>

                    <td>
                      {guardia.horaInicio} -{' '}
                      {guardia.horaFin}
                    </td>

                    <td>{guardia.rol}</td>

                    <td>
                      <span className="empleado-badge">
                        {guardia.estado}
                      </span>
                    </td>

                    <td className="empleado-acciones">
                      <button
                        type="button"
                        className={
                          pendiente
                            ? 'empleado-btn-solicitud-realizada'
                            : 'empleado-btn-solicitar-cambio'
                        }
                        disabled={pendiente}
                        onClick={() =>
                          solicitarCambio(guardia.id)
                        }
                      >
                        {pendiente
                          ? 'Solicitud realizada'
                          : 'Solicitar Cambio'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
    </div>
  )
}

export default MisGuardias