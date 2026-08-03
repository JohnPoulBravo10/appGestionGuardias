import React, { useState } from 'react'

import ModalMensaje from '../common/ui/ModalMensaje'

const API_BASE_URL = 'http://localhost:8090'

const guardiaInicial = {
  fecha: '',
  horaInicio: '',
  horaFin: '',
  rol: '',
  empleadoId: '',
}

function FormularioCrearGuardias({
  setPagina,
}) {
  const [empleados, setEmpleados] =
    useState([])

  const [guardia, setGuardia] =
    useState(guardiaInicial)

  const [guardando, setGuardando] =
    useState(false)

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

      setEmpleados([])
    }
  }

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
      setPagina('GESTION GUARDIAS')
    }
  }

  const guardarGuardia = async (
    event
  ) => {
    event.preventDefault()

    if (guardando) {
      return
    }

    try {
      setGuardando(true)

      const response = await fetch(
        `${API_BASE_URL}/api/guardias`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            ...guardia,

            empleadoId:
              guardia.empleadoId === '' ||
              guardia.empleadoId === null
                ? null
                : Number(
                    guardia.empleadoId
                  ),
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          'No se pudo crear la guardia'
        )
      }

      setGuardia(guardiaInicial)
      setEmpleados([])

      setModal({
        visible: true,
        tipo: 'exito',
        titulo: 'Guardia creada',
        mensaje:
          'La guardia se creó con éxito.',
        volver: true,
      })
    } catch (error) {
      console.error(
        'Error al crear guardia:',
        error
      )

      setModal({
        visible: true,
        tipo: 'error',
        titulo: 'Error',
        mensaje:
          'No se pudo crear la guardia.',
        volver: false,
      })
    } finally {
      setGuardando(false)
    }
  }

  const volverAGestion = () => {
    setPagina('GESTION GUARDIAS')
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
          Crear Nueva Guardia
        </h3>

        <form
          className="admin-form-generico"
          onSubmit={guardarGuardia}
        >
          <div className="admin-form-group">
            <label htmlFor="fecha-guardia">
              Fecha de la Guardia
            </label>

            <input
              id="fecha-guardia"
              type="date"
              className="admin-input-estilo"
              value={guardia.fecha}
              onChange={(event) =>
                setGuardia({
                  ...guardia,
                  fecha:
                    event.target.value,
                })
              }
              required
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="hora-inicio">
                Hora de Inicio
              </label>

              <input
                id="hora-inicio"
                type="time"
                className="admin-input-estilo"
                value={
                  guardia.horaInicio
                }
                onChange={(event) =>
                  setGuardia({
                    ...guardia,
                    horaInicio:
                      event.target.value,
                  })
                }
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="hora-fin">
                Hora de Fin
              </label>

              <input
                id="hora-fin"
                type="time"
                className="admin-input-estilo"
                value={guardia.horaFin}
                onChange={(event) =>
                  setGuardia({
                    ...guardia,
                    horaFin:
                      event.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="rol-guardia">
              Área de Trabajo
            </label>

            <select
              id="rol-guardia"
              className="admin-input-estilo"
              value={guardia.rol}
              onChange={(event) => {
                const rol =
                  event.target.value

                setGuardia({
                  ...guardia,
                  rol,
                  empleadoId: '',
                })

                cargarEmpleadosPorRol(
                  rol
                )
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
            <label htmlFor="empleado-guardia">
              Personal Asignado (Opcional)
            </label>

            <select
              id="empleado-guardia"
              className="admin-input-estilo"
              value={
                guardia.empleadoId ?? ''
              }
              onChange={(event) =>
                setGuardia({
                  ...guardia,

                  empleadoId:
                    event.target.value === ''
                      ? ''
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
            disabled={guardando}
          >
            {guardando
              ? 'Guardando...'
              : 'Guardar Guardia'}
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

export default FormularioCrearGuardias