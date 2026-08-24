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

import ModalConfirmacion from '../common/ui/ModalConfirmacion'
import ModalMensaje from '../common/ui/ModalMensaje'

const API_BASE_URL = 'http://localhost:8090'

function GestionGuardias({
  setPagina,
  setGuardiaEditar,
}) {
  const [guardias, setGuardias] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [textoBusqueda, setTextoBusqueda] =
    useState('')

  const [filtroArea, setFiltroArea] =
    useState('TODAS')

  const [filtroEstado, setFiltroEstado] =
    useState('TODOS')

  const [filtroFecha, setFiltroFecha] =
    useState('')

  const [ahora, setAhora] =
    useState(new Date())

  const [
    guardiaAEliminar,
    setGuardiaAEliminar,
  ] = useState(null)

  const [modal, setModal] = useState({
    visible: false,
    tipo: 'exito',
    titulo: '',
    mensaje: '',
  })

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

      const response = await fetch(
        `${API_BASE_URL}/api/guardias`
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

        const coincideEstado =
          filtroEstado === 'TODOS' ||
          estadoCalculado === filtroEstado

        const coincideFecha =
          !filtroFecha ||
          guardia.fecha === filtroFecha

        return (
          coincideBusqueda &&
          coincideArea &&
          coincideEstado &&
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
    filtroEstado,
    filtroFecha,
    ahora,
  ])

  const solicitarEliminarGuardia = (
    guardia
  ) => {
    setGuardiaAEliminar(guardia)
  }

  const cancelarEliminacion = () => {
    setGuardiaAEliminar(null)
  }

  const confirmarEliminacion = async () => {
    if (!guardiaAEliminar) {
      return
    }

    const id = guardiaAEliminar.id

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/guardias/${id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error(
          'Error al eliminar guardia'
        )
      }

      setGuardiaAEliminar(null)

      setGuardias(
        (guardiasActuales) =>
          guardiasActuales.filter(
            (guardia) =>
              guardia.id !== id
          )
      )

      setModal({
        visible: true,
        tipo: 'exito',
        titulo: 'Guardia eliminada',
        mensaje:
          'La guardia se eliminó con éxito.',
      })
    } catch (error) {
      console.error(
        'Error al eliminar guardia:',
        error
      )

      setGuardiaAEliminar(null)

      setModal({
        visible: true,
        tipo: 'error',
        titulo: 'Error',
        mensaje:
          'No se pudo eliminar la guardia.',
      })
    }
  }

  const cerrarModalMensaje = () => {
    setModal((modalActual) => ({
      ...modalActual,
      visible: false,
    }))
  }

  const editarGuardia = (guardia) => {
    setGuardiaEditar(guardia)
    setPagina('EDITAR GUARDIA')
  }

  const limpiarFiltros = () => {
    setTextoBusqueda('')
    setFiltroArea('TODAS')
    setFiltroEstado('TODOS')
    setFiltroFecha('')
  }

  return (
    <>
      <div className="admin-tabla-container">
        <div className="admin-header-tabla">
          <h3>Gestión de Guardias</h3>

          <button
            type="button"
            className="admin-btn-nuevo"
            onClick={() =>
              setPagina('CREAR GUARDIAS')
            }
          >
            + Crear Guardia
          </button>
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

            <option value="ADMINISTRADOR">
              Administrador
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

          <select
            className="admin-input-filtro"
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
              filtroEstado === 'TODOS' &&
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
          <p>No se encontraron guardias.</p>
        ) : (
          <table className="admin-tabla-guardias">
            <thead>
              <tr>
                <th>FECHA</th>
                <th>HORARIO</th>
                <th>ÁREA</th>
                <th>PERSONAL ASIGNADO</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
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

                  // Las guardias terminadas o en curso no pueden modificarse ni eliminarse
                  const esInmodificable =
                    estadoCalculado === 'TERMINADA' ||
                    estadoCalculado === 'EN CURSO'

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

                      <td className="admin-acciones">
                        <button
                          type="button"
                          className="admin-accion-editar"
                          disabled={esInmodificable}
                          title={
                            esInmodificable
                              ? 'No se puede editar una guardia terminada o en curso'
                              : ''
                          }
                          onClick={() =>
                            editarGuardia(
                              guardia
                            )
                          }
                        >
                          ✎ Editar
                        </button>

                        <button
                          type="button"
                          className="admin-accion-eliminar"
                          disabled={esInmodificable}
                          title={
                            esInmodificable
                              ? 'No se puede eliminar una guardia terminada o en curso'
                              : ''
                          }
                          onClick={() =>
                            solicitarEliminarGuardia(
                              guardia
                            )
                          }
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  )
                }
              )}
            </tbody>
          </table>
        )}
      </div>

      <ModalConfirmacion
        visible={guardiaAEliminar !== null}
        titulo="Eliminar guardia"
        mensaje={
          guardiaAEliminar
            ? `¿Desea eliminar la guardia del día ${guardiaAEliminar.fecha} (${guardiaAEliminar.horaInicio} - ${guardiaAEliminar.horaFin})?`
            : ''
        }
        onConfirmar={confirmarEliminacion}
        onCancelar={cancelarEliminacion}
      />

      <ModalMensaje
        visible={modal.visible}
        tipo={modal.tipo}
        titulo={modal.titulo}
        mensaje={modal.mensaje}
        onCerrar={cerrarModalMensaje}
      />
    </>
  )
}

export default GestionGuardias