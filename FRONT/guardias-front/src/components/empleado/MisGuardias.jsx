import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getEmpleadoIdFromToken,
  getToken,
} from '../../utils/authUtils'

import {
  calcularEstadoGuardia,
  formatearEstadoGuardia,
  obtenerClaseEstadoGuardia,
} from '../../utils/guardiaUtils'

const API_BASE_URL = 'http://localhost:8090'

function MisGuardias() {
  const [loading, setLoading] =
    useState(true)

  const [guardias, setGuardias] =
    useState([])

  const [error, setError] =
    useState('')

  const [filtroEstado, setFiltroEstado] =
    useState('TODOS')

  const [filtroFecha, setFiltroFecha] =
    useState('')

  const [ahora, setAhora] =
    useState(new Date())

  useEffect(() => {
    const empleadoId =
      getEmpleadoIdFromToken()

    if (!empleadoId) {
      setError(
        'No se pudo identificar al empleado autenticado.'
      )

      setLoading(false)
      return
    }

    obtenerGuardias(empleadoId)
  }, [])

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAhora(new Date())
    }, 60000)

    return () => {
      clearInterval(intervalo)
    }
  }, [])

  const obtenerGuardias = async (
    empleadoId
  ) => {
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
            Authorization:
              `Bearer ${token}`,
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
        Array.isArray(data)
          ? data
          : []
      )
    } catch (errorPeticion) {
      console.error(
        'Error al obtener guardias:',
        errorPeticion
      )

      setError(
        errorPeticion.message ||
          'Ocurrió un error al cargar las guardias.'
      )
    } finally {
      setLoading(false)
    }
  }

  const guardiasVisibles = useMemo(() => {
    return guardias.filter((guardia) => {
      const estadoCalculado =
        calcularEstadoGuardia(
          guardia,
          ahora
        )

      const coincideEstado =
        filtroEstado === 'TODOS' ||
        estadoCalculado === filtroEstado

      const coincideFecha =
        !filtroFecha ||
        guardia.fecha === filtroFecha

      return (
        coincideEstado &&
        coincideFecha
      )
    })
  }, [
    guardias,
    filtroEstado,
    filtroFecha,
    ahora,
  ])

  const limpiarFiltros = () => {
    setFiltroEstado('TODOS')
    setFiltroFecha('')
  }

  return (
    <div className="empleado-tabla-container">
      <div className="empleado-header-tabla">
        <h3>MIS GUARDIAS</h3>
      </div>

      <div className="empleado-filtros-guardias">
        <select
          className="empleado-input-filtro"
          value={filtroEstado}
          onChange={(event) =>
            setFiltroEstado(
              event.target.value
            )
          }
          aria-label="Filtrar por estado"
        >
          <option value="TODOS">
            Todos los estados
          </option>

          <option value="PROXIMA">
            Próxima
          </option>

          <option value="EN CURSO">
            En curso
          </option>

          <option value="TERMINADA">
            Terminada
          </option>

          <option value="SIN ASIGNAR">
            Sin asignar
          </option>
        </select>

        <input
          type="date"
          className="empleado-input-filtro"
          value={filtroFecha}
          onChange={(event) =>
            setFiltroFecha(
              event.target.value
            )
          }
          aria-label="Filtrar por fecha"
        />

        <button
          type="button"
          className="empleado-btn-limpiar-filtros"
          onClick={limpiarFiltros}
          disabled={
            filtroEstado === 'TODOS' &&
            !filtroFecha
          }
        >
          Limpiar
        </button>
      </div>

      {!loading && !error && (
        <p className="empleado-contador-guardias">
          Mostrando{' '}
          {guardiasVisibles.length} de{' '}
          {guardias.length} guardias
        </p>
      )}

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
          <p>
            No tenés guardias asignadas.
          </p>
        )}

      {!loading &&
        !error &&
        guardias.length > 0 &&
        guardiasVisibles.length === 0 && (
          <p>
            No se encontraron guardias con esos filtros.
          </p>
        )}

      {!loading &&
        !error &&
        guardiasVisibles.length > 0 && (
          <table className="empleado-tabla-guardias">
            <thead>
              <tr>
                <th>FECHA</th>
                <th>HORARIO</th>
                <th>ÁREA</th>
                <th>ESTADO</th>
              </tr>
            </thead>

            <tbody>
              {guardiasVisibles.map(
                (guardia) => {
                  const estadoCalculado =
                    calcularEstadoGuardia(
                      guardia,
                      ahora
                    )

                  const claseEstado =
                    obtenerClaseEstadoGuardia(
                      estadoCalculado
                    )

                  return (
                    <tr key={guardia.id}>
                      <td>
                        {guardia.fecha}
                      </td>

                      <td>
                        {guardia.horaInicio}
                        {' - '}
                        {guardia.horaFin}
                      </td>

                      <td>
                        {guardia.rol}
                      </td>

                      <td>
                        <span
                          className={
                            `empleado-badge estado-${claseEstado}`
                          }
                        >
                          {formatearEstadoGuardia(
                            estadoCalculado
                          )}
                        </span>
                      </td>
                    </tr>
                  )
                }
              )}
            </tbody>
          </table>
        )}
    </div>
  )
}

export default MisGuardias