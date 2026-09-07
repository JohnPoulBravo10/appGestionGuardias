import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  calcularEstadoGuardia,
  formatearEstadoGuardia,
  obtenerClaseEstadoGuardia,
} from '../../utils/guardiaUtils'

import { getToken } from '../../utils/authUtils'

const API_BASE_URL = 'http://localhost:8090'

/**
 * Componente de solo lectura que muestra el historial de guardias terminadas.
 * No permite crear, editar ni eliminar guardias.
 */
function HistorialGuardias() {
  const [guardias, setGuardias] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [textoBusqueda, setTextoBusqueda] =
    useState('')

  const [filtroArea, setFiltroArea] =
    useState('TODAS')

  const [filtroFecha, setFiltroFecha] =
    useState('')

  const [ahora, setAhora] =
    useState(new Date())

  useEffect(() => {
    obtenerGuardias()
  }, [])

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAhora(new Date())
    }, 60000)

    return () => {
      clearInterval(intervalo)
    }
  }, [])

  const obtenerGuardias = async () => {
    try {
      setLoading(true)

      const token = getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await fetch(
        `${API_BASE_URL}/api/guardias`,
        { headers }
      )

      if (!response.ok) {
        throw new Error(
          'Error al obtener guardias'
        )
      }

      const data = await response.json()

      setGuardias(
        Array.isArray(data) ? data : []
      )
    } catch (error) {
      console.error(
        'Error al obtener guardias:',
        error
      )
    } finally {
      setLoading(false)
    }
  }

  /**
   * Filtra las guardias para mostrar únicamente las terminadas,
   * aplicando además los filtros de búsqueda, área y fecha.
   */
  const guardiasVisibles = useMemo(() => {
    const textoNormalizado =
      textoBusqueda
        .trim()
        .toLowerCase()

    return guardias
      .filter((guardia) => {
        const nombreEmpleado = String(
          guardia.empleadoNombre ?? ''
        ).toLowerCase()

        const dniEmpleado = String(
          guardia.empleadoId ?? ''
        )

        const estadoCalculado =
          calcularEstadoGuardia(
            guardia,
            ahora
          )

        // Solo mostrar guardias terminadas
        if (estadoCalculado !== 'TERMINADA') {
          return false
        }

        const coincideBusqueda =
          !textoNormalizado ||
          nombreEmpleado.includes(
            textoNormalizado
          ) ||
          dniEmpleado.includes(
            textoNormalizado
          )

        const coincideArea =
          filtroArea === 'TODAS' ||
          guardia.rol === filtroArea

        const coincideFecha =
          !filtroFecha ||
          guardia.fecha === filtroFecha

        return (
          coincideBusqueda &&
          coincideArea &&
          coincideFecha
        )
      })
      .sort((a, b) => {
        // Ordenar por fecha ascendente; si coinciden, por hora de inicio
        const comparacionFecha =
          (a.fecha ?? '').localeCompare(
            b.fecha ?? ''
          )

        if (comparacionFecha !== 0) {
          return comparacionFecha
        }

        return (a.horaInicio ?? '').localeCompare(
          b.horaInicio ?? ''
        )
      })
  }, [
    guardias,
    textoBusqueda,
    filtroArea,
    filtroFecha,
    ahora,
  ])

  const limpiarFiltros = () => {
    setTextoBusqueda('')
    setFiltroArea('TODAS')
    setFiltroFecha('')
  }

  return (
    <div className="admin-tabla-container">
      <div className="admin-header-tabla">
        <h3>Historial de Guardias</h3>
      </div>

      <div className="admin-filtros-guardias">
        <input
          type="text"
          className="admin-input-busqueda"
          placeholder="🔍 Buscar por nombre o DNI..."
          value={textoBusqueda}
          onChange={(event) =>
            setTextoBusqueda(
              event.target.value
            )
          }
        />

        <select
          className="admin-input-filtro"
          value={filtroArea}
          onChange={(event) =>
            setFiltroArea(
              event.target.value
            )
          }
          aria-label="Filtrar por área"
        >
          <option value="TODAS">
            Todas las áreas
          </option>

          <option value="ENFERMERIA">
            Enfermería
          </option>

          <option value="LIMPIEZA">
            Limpieza
          </option>

          <option value="MANTENIMIENTO">
            Mantenimiento
          </option>
        </select>

        <input
          type="date"
          className="admin-input-filtro admin-filtro-fecha"
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
          className="admin-btn-limpiar-filtros"
          onClick={limpiarFiltros}
          disabled={
            !textoBusqueda &&
            filtroArea === 'TODAS' &&
            !filtroFecha
          }
        >
          Limpiar
        </button>
      </div>

      {!loading && (
        <p className="admin-contador-guardias">
          Mostrando{' '}
          {guardiasVisibles.length} de{' '}
          {guardias.length} guardias
        </p>
      )}

      {loading ? (
        <p>Cargando guardias...</p>
      ) : guardiasVisibles.length === 0 ? (
        <p>No se encontraron guardias terminadas.</p>
      ) : (
        <table className="admin-tabla-guardias">
          <thead>
            <tr>
              <th>FECHA</th>
              <th>HORARIO</th>
              <th>ÁREA</th>
              <th>PERSONAL ASIGNADO</th>
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
                    <td>{guardia.fecha}</td>

                    <td>
                      {guardia.horaInicio}
                      {' - '}
                      {guardia.horaFin}
                    </td>

                    <td>{guardia.rol}</td>

                    <td>
                      {guardia.empleadoId ? (
                        <div className="admin-empleado-info">
                          <span className="admin-empleado-dni">
                            {guardia.empleadoId}
                          </span>

                          <span className="admin-empleado-nombre">
                            {guardia.empleadoNombre ||
                              'Empleado no encontrado'}
                          </span>
                        </div>
                      ) : (
                        'Sin asignar'
                      )}
                    </td>

                    <td>
                      <span
                        className={
                          `admin-badge estado-${claseEstado}`
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

export default HistorialGuardias
