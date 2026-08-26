import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import ModalMensaje from '../common/ui/ModalMensaje'
import { validarGuardia } from '../../utils/validacionesGuardia'
import { filtrarEmpleadosDisponibles } from '../../utils/guardiaUtils'

const API_BASE_URL = 'http://localhost:8090'

/**
 * Determina la clase CSS del input según si tiene error de validación.
 * Concatena la clase base con la clase de error cuando corresponde.
 */
function claseInput(errorCampo) {
  return errorCampo
    ? 'admin-input-estilo admin-input-error'
    : 'admin-input-estilo'
}

function EditarGuardia({
  setPagina,
  guardiaEditar,
  setGuardiaEditar,
}) {
  const [empleados, setEmpleados] =
    useState([])

  /** Todas las guardias del sistema, para filtrar empleados ocupados */
  const [guardiasExistentes, setGuardiasExistentes] =
    useState([])

  /** Errores de validación: { campo: mensajeError } */
  const [errores, setErrores] =
    useState({})

  const [guardando, setGuardando] =
    useState(false)

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
    setGuardiaEditar(
      (guardiaActual) => ({
        ...guardiaActual,
        [campo]: valor,
      })
    )

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
      setGuardiasExistentes([])
      return
    }

    try {
      const [respEmpleados, respGuardias] =
        await Promise.all([
          fetch(
            `${API_BASE_URL}/api/empleados?rol=${rol}`
          ),
          fetch(
            `${API_BASE_URL}/api/guardias`
          ),
        ])

      if (!respEmpleados.ok) {
        throw new Error(
          'Error al obtener empleados'
        )
      }

      const dataEmpleados =
        await respEmpleados.json()

      setEmpleados(
        Array.isArray(dataEmpleados)
          ? dataEmpleados
          : []
      )

      if (respGuardias.ok) {
        const dataGuardias =
          await respGuardias.json()

        setGuardiasExistentes(
          Array.isArray(dataGuardias)
            ? dataGuardias
            : []
        )
      }
    } catch (error) {
      console.error(
        'Error al cargar empleados:',
        error
      )
    }
  }

  /**
   * Empleados filtrados que no tienen una guardia
   * asignada que se solape con la guardia en edición.
   * Se excluye la guardia actual para que su empleado asignado siga disponible.
   */
  const empleadosDisponibles = useMemo(
    () =>
      filtrarEmpleadosDisponibles(
        empleados,
        guardiasExistentes,
        {
          fecha: guardiaEditar?.fecha,
          horaInicio:
            guardiaEditar?.horaInicio,
          horaFin: guardiaEditar?.horaFin,
        },
        guardiaEditar?.id ?? null
      ),
    [
      empleados,
      guardiasExistentes,
      guardiaEditar?.fecha,
      guardiaEditar?.horaInicio,
      guardiaEditar?.horaFin,
      guardiaEditar?.id,
    ]
  )

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
      validarGuardia(guardiaEditar)

    if (erroresValidacion) {
      setErrores(erroresValidacion)
      return
    }

    /* Limpiar errores previos antes de enviar */
    setErrores({})

    try {
      setGuardando(true)

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
            'No se pudo modificar la guardia'
          )
        }

        return
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
    } finally {
      setGuardando(false)
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
              value={guardiaEditar.fecha}
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
                  guardiaEditar.horaInicio
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
                value={
                  guardiaEditar.horaFin
                }
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
              value={guardiaEditar.rol}
              onChange={(event) => {
                const rol =
                  event.target.value

                actualizarCampo(
                  'rol',
                  rol
                )

                setGuardiaEditar(
                  (guardiaActual) => ({
                    ...guardiaActual,
                    empleadoId: null,
                  })
                )

                cargarEmpleadosPorRol(rol)
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
                guardiaEditar.empleadoId ??
                ''
              }
              onChange={(event) =>
                actualizarCampo(
                  'empleadoId',
                  event.target.value === ''
                    ? null
                    : Number(
                        event.target.value
                      )
                )
              }
            >
              <option value="">
                Dejar sin asignar
              </option>

              {empleadosDisponibles.map(
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

export default EditarGuardia