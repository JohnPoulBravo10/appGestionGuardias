import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import ModalMensaje from '../common/ui/ModalMensaje'
import { validarGuardia } from '../../utils/validacionesGuardia'
import { filtrarEmpleadosDisponibles } from '../../utils/guardiaUtils'

import { getToken } from '../../utils/authUtils'

const API_BASE_URL = 'http://localhost:8090'

const guardiaInicial = {
  fecha: '',
  horaInicio: '',
  horaFin: '',
  rol: '',
  empleadoId: '',
}

// Asigna clase de error visual al input si existe fallo de validación
function claseInput(errorCampo) {
  return errorCampo
    ? 'admin-input-estilo admin-input-error'
    : 'admin-input-estilo'
}

// Formulario de creación de guardias: valida límites de horario/fecha y filtra personal disponible en el área seleccionada.
function FormularioCrearGuardias() {
  const navigate = useNavigate()
  const [empleados, setEmpleados] =
    useState([])

  const [guardiasExistentes, setGuardiasExistentes] =
    useState([])

  const [guardia, setGuardia] =
    useState(guardiaInicial)

  const [guardando, setGuardando] =
    useState(false)

  const [errores, setErrores] =
    useState({})

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
    setGuardia((guardiaActual) => ({
      ...guardiaActual,
      [campo]: valor,
    }))

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

  // Carga empleados del área seleccionada y la lista completa de guardias para verificar solapamientos
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

      setEmpleados([])
    }
  }

  // Filtra empleados del área que no posean guardias que se superpongan en fecha y horario
  const empleadosDisponibles = useMemo(
    () =>
      filtrarEmpleadosDisponibles(
        empleados,
        guardiasExistentes,
        {
          fecha: guardia.fecha,
          horaInicio: guardia.horaInicio,
          horaFin: guardia.horaFin,
        }
      ),
    [
      empleados,
      guardiasExistentes,
      guardia.fecha,
      guardia.horaInicio,
      guardia.horaFin,
    ]
  )

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

  // Extrae errores de validación estructurados del backend si están disponibles
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

  // Valida los datos y envía la petición de creación de guardia
  const guardarGuardia = async (
    event
  ) => {
    event.preventDefault()

    if (guardando) {
      return
    }

    // Validación en el frontend antes de emitir la petición
    const erroresValidacion =
      validarGuardia(guardia)

    if (erroresValidacion) {
      setErrores(erroresValidacion)
      return
    }

    setErrores({})

    try {
      setGuardando(true)

      const token = getToken()

      const response = await fetch(
        `${API_BASE_URL}/api/guardias`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    navigate('/admin/guardias')
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

export default FormularioCrearGuardias