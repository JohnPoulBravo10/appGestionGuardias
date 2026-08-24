import React, { useState } from 'react'

import ModalMensaje from '../common/ui/ModalMensaje'
import { validarGuardia } from '../../utils/validacionesGuardia'

const API_BASE_URL = 'http://localhost:8090'

const guardiaInicial = {
  fecha: '',
  horaInicio: '',
  horaFin: '',
  rol: '',
  empleadoId: '',
}

/**
 * Determina la clase CSS del input según si tiene error de validación.
 * Concatena la clase base con la clase de error cuando corresponde.
 */
function claseInput(errorCampo) {
  return errorCampo
    ? 'admin-input-estilo admin-input-error'
    : 'admin-input-estilo'
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

  /** Errores de validación: { campo: mensajeError } */
  const [errores, setErrores] =
    useState({})

  const [modal, setModal] = useState({
    visible: false,
    tipo: 'exito',
    titulo: '',
    mensaje: '',
    volver: false,
  })

  /**
   * Actualiza un campo del formulario y limpia
   * su error de validación asociado si existía.
   */
  const actualizarCampo = (
    campo,
    valor
  ) => {
    setGuardia((guardiaActual) => ({
      ...guardiaActual,
      [campo]: valor,
    }))

    /* Limpiar el error del campo que se está corrigiendo */
    if (errores[campo]) {
      setErrores((erroresActuales) => {
        const nuevosErrores = {
          ...erroresActuales,
        }
        delete nuevosErrores[campo]
        return nuevosErrores
      })
    }
  }

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

  /**
   * Procesa la respuesta de error del backend y extrae
   * errores de campo para mostrarlos inline.
   *
   * @param {Response} response - respuesta HTTP del backend
   * @returns {boolean} true si se encontraron errores de campo
   */
  const procesarErroresBackend = async (
    response
  ) => {
    try {
      const contentType =
        response.headers.get('content-type')

      if (
        !contentType?.includes(
          'application/json'
        )
      ) {
        return false
      }

      const data = await response.json()

      if (data.errores) {
        setErrores(data.errores)
        return true
      }
    } catch {
      /* Si no se puede parsear la respuesta, no hay errores de campo */
    }

    return false
  }

  const guardarGuardia = async (
    event
  ) => {
    event.preventDefault()

    if (guardando) {
      return
    }

    /* ── Validación frontend ── */
    const erroresValidacion =
      validarGuardia(guardia)

    if (erroresValidacion) {
      setErrores(erroresValidacion)
      return
    }

    /* Limpiar errores previos antes de enviar */
    setErrores({})

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
        /*
         * Intentar extraer errores de campo del backend.
         * Si el backend devuelve errores estructurados,
         * se muestran inline y no se muestra el modal genérico.
         */
        const tieneErroresCampo =
          await procesarErroresBackend(
            response
          )

        if (!tieneErroresCampo) {
          throw new Error(
            'No se pudo crear la guardia'
          )
        }

        return
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
          noValidate
        >
          <div className="admin-form-group">
            <label htmlFor="fecha-guardia">
              Fecha de la Guardia
            </label>

            <input
              id="fecha-guardia"
              type="date"
              className={claseInput(
                errores.fecha
              )}
              value={guardia.fecha}
              onChange={(event) =>
                actualizarCampo(
                  'fecha',
                  event.target.value
                )
              }
            />

            {errores.fecha && (
              <span className="admin-campo-error">
                {errores.fecha}
              </span>
            )}
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="hora-inicio">
                Hora de Inicio
              </label>

              <input
                id="hora-inicio"
                type="time"
                className={claseInput(
                  errores.horaInicio
                )}
                value={
                  guardia.horaInicio
                }
                onChange={(event) =>
                  actualizarCampo(
                    'horaInicio',
                    event.target.value
                  )
                }
              />

              {errores.horaInicio && (
                <span className="admin-campo-error">
                  {errores.horaInicio}
                </span>
              )}
            </div>

            <div className="admin-form-group">
              <label htmlFor="hora-fin">
                Hora de Fin
              </label>

              <input
                id="hora-fin"
                type="time"
                className={claseInput(
                  errores.horaFin
                )}
                value={guardia.horaFin}
                onChange={(event) =>
                  actualizarCampo(
                    'horaFin',
                    event.target.value
                  )
                }
              />

              {errores.horaFin && (
                <span className="admin-campo-error">
                  {errores.horaFin}
                </span>
              )}
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="rol-guardia">
              Área de Trabajo
            </label>

            <select
              id="rol-guardia"
              className={claseInput(
                errores.rol
              )}
              value={guardia.rol}
              onChange={(event) => {
                const rol =
                  event.target.value

                actualizarCampo(
                  'rol',
                  rol
                )

                setGuardia(
                  (guardiaActual) => ({
                    ...guardiaActual,
                    empleadoId: '',
                  })
                )

                cargarEmpleadosPorRol(
                  rol
                )
              }}
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
            </select>

            {errores.rol && (
              <span className="admin-campo-error">
                {errores.rol}
              </span>
            )}
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
                actualizarCampo(
                  'empleadoId',
                  event.target.value === ''
                    ? ''
                    : Number(
                      event.target.value
                    )
                )
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