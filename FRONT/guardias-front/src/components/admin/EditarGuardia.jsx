import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import ModalMensaje from '../common/ui/ModalMensaje'
import { validarGuardia } from '../../utils/validacionesGuardia'
import { filtrarEmpleadosDisponibles } from '../../utils/guardiaUtils'

import { getToken } from '../../utils/authUtils'

const API_BASE_URL = 'http://localhost:8090'

// Asigna clase de error visual al input si existe fallo de validación
function claseInput(errorCampo) {
  return errorCampo
    ? 'admin-input-estilo admin-input-error'
    : 'admin-input-estilo'
}

// Formulario de edición de guardias: carga la guardia desde el estado de navegación y permite reasignar horario, área o empleado.
function EditarGuardia() {
  const location = useLocation()
  const navigate = useNavigate()

  const [guardiaEditar, setGuardiaEditar] = useState(
    location.state?.guardiaEditar || null
  )
  const [empleados, setEmpleados] =
    useState([])

  const [guardiasExistentes, setGuardiasExistentes] =
    useState([])

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

  // Actualiza un campo del formulario y elimina su error de validación previo
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

  // Carga la lista de empleados del área y las guardias existentes para verificar solapamientos
  const cargarEmpleadosPorRol = async (
    rol
  ) => {
    if (!rol) {
      setEmpleados([])
      setGuardiasExistentes([])
      return
    }

    try {
      const token = getToken()

      const [respEmpleados, respGuardias] =
        await Promise.all([
          fetch(
            `${API_BASE_URL}/api/empleados/area/${rol}`,
            {
              method: 'GET',
              headers: {
                'Content-Type':
                  'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            }
          ),
          fetch(
            `${API_BASE_URL}/api/guardias`,
            {
              method: 'GET',
              headers: {
                'Content-Type':
                  'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            }
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

  // Filtra empleados disponibles excluyendo la guardia actual para permitir mantener la asignación
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
      navigate('/admin/guardias')
    }
  }

  // Extrae errores de validación estructurados del backend si están presentes
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
      // Si la respuesta no es JSON, se maneja como error genérico
    }

    return false
  }

  // Valida y envía los cambios de la guardia mediante PUT
  const guardarGuardia = async (
    event
  ) => {
    event.preventDefault()

    if (guardando) {
      return
    }

    // Validación frontend de horarios y fechas
    const erroresValidacion =
      validarGuardia(guardiaEditar)

    if (erroresValidacion) {
      setErrores(erroresValidacion)
      return
    }

    setErrores({})

    try {
      setGuardando(true)

      const token = getToken()

      const response = await fetch(
        `${API_BASE_URL}/api/guardias/${guardiaEditar.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    navigate('/admin/guardias')
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