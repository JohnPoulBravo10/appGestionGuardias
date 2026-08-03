import React, {
  useEffect,
  useState,
} from 'react'

import ModalMensaje from '../common/ui/ModalMensaje'

const API_BASE_URL = 'http://localhost:8090'

function EditarGuardia({
  setPagina,
  guardiaEditar,
  setGuardiaEditar,
}) {
  const [empleados, setEmpleados] =
    useState([])

  const [modal, setModal] = useState({
    visible: false,
    tipo: 'exito',
    titulo: '',
    mensaje: '',
    volver: false,
  })

  const cargarEmpleadosPorRol = async (
    rol
  ) => {
    if (!rol) {
      setEmpleados([])
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/empleados?rol=${rol}`
      )

      if (!response.ok) {
        throw new Error(
          'Error al obtener empleados'
        )
      }

      const data = await response.json()

      setEmpleados(
        Array.isArray(data) ? data : []
      )
    } catch (error) {
      console.error(
        'Error al cargar empleados:',
        error
      )
    }
  }

  useEffect(() => {
    if (guardiaEditar?.rol) {
      cargarEmpleadosPorRol(
        guardiaEditar.rol
      )
    }
  }, [guardiaEditar?.rol])

  const cerrarModal = () => {
    const debeVolver = modal.volver

    setModal({
      visible: false,
      tipo: 'exito',
      titulo: '',
      mensaje: '',
      volver: false,
    })

    if (debeVolver) {
      setGuardiaEditar(null)
      setPagina('GESTION GUARDIAS')
    }
  }

  const guardarGuardia = async (
    event
  ) => {
    event.preventDefault()

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/guardias/${guardiaEditar.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify(
            guardiaEditar
          ),
        }
      )

      if (!response.ok) {
        throw new Error(
          'No se pudo modificar la guardia'
        )
      }

      setModal({
        visible: true,
        tipo: 'exito',
        titulo: 'Guardia modificada',
        mensaje:
          'La guardia se modificó con éxito.',
        volver: true,
      })
    } catch (error) {
      console.error(
        'Error al modificar guardia:',
        error
      )

      setModal({
        visible: true,
        tipo: 'error',
        titulo: 'Error',
        mensaje:
          'No se pudo modificar la guardia.',
        volver: false,
      })
    }
  }

  const volverAGestion = () => {
    setGuardiaEditar(null)
    setPagina('GESTION GUARDIAS')
  }

  if (!guardiaEditar) {
    return <p>Cargando...</p>
  }

  return (
    <>
      <div className="admin-form-container">
        <button
          type="button"
          className="admin-btn-volver"
          onClick={volverAGestion}
        >
          ← Volver
        </button>

        <h3 className="admin-titulo-formulario">
          Editar Guardia
        </h3>

        <form
          className="admin-form-generico"
          onSubmit={guardarGuardia}
        >
          <div className="admin-form-group">
            <label>
              Fecha de la Guardia
            </label>

            <input
              type="date"
              className="admin-input-estilo"
              value={guardiaEditar.fecha}
              onChange={(event) =>
                setGuardiaEditar({
                  ...guardiaEditar,
                  fecha: event.target.value,
                })
              }
              required
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Hora Inicio</label>

              <input
                type="time"
                className="admin-input-estilo"
                value={
                  guardiaEditar.horaInicio
                }
                onChange={(event) =>
                  setGuardiaEditar({
                    ...guardiaEditar,
                    horaInicio:
                      event.target.value,
                  })
                }
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Hora Fin</label>

              <input
                type="time"
                className="admin-input-estilo"
                value={
                  guardiaEditar.horaFin
                }
                onChange={(event) =>
                  setGuardiaEditar({
                    ...guardiaEditar,
                    horaFin:
                      event.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Área</label>

            <select
              className="admin-input-estilo"
              value={guardiaEditar.rol}
              onChange={(event) => {
                const rol =
                  event.target.value

                setGuardiaEditar({
                  ...guardiaEditar,
                  rol,
                  empleadoId: null,
                })

                cargarEmpleadosPorRol(rol)
              }}
              required
            >
              <option value="">
                Seleccione un área
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

              <option value="ADMINISTRADOR">
                Administrador
              </option>
            </select>
          </div>

          <div className="admin-form-group">
            <label>
              Personal Asignado
            </label>

            <select
              className="admin-input-estilo"
              value={
                guardiaEditar.empleadoId ??
                ''
              }
              onChange={(event) =>
                setGuardiaEditar({
                  ...guardiaEditar,

                  empleadoId:
                    event.target.value === ''
                      ? null
                      : Number(
                          event.target.value
                        ),
                })
              }
            >
              <option value="">
                Dejar sin asignar
              </option>

              {empleados.map(
                (empleado) => (
                  <option
                    key={empleado.dni}
                    value={empleado.dni}
                  >
                    {empleado.nombre}{' '}
                    {empleado.apellido}
                  </option>
                )
              )}
            </select>
          </div>

          <button
            type="submit"
            className="admin-btn-guardar"
          >
            Guardar Guardia
          </button>
        </form>
      </div>

      <ModalMensaje
        visible={modal.visible}
        tipo={modal.tipo}
        titulo={modal.titulo}
        mensaje={modal.mensaje}
        onCerrar={cerrarModal}
      />
    </>
  )
}

export default EditarGuardia