import React, {
  useEffect,
  useState,
} from 'react'

import ModalMensaje from '../common/ui/ModalMensaje'

import {
  validarEmpleado,
  LIMITES,
} from '../../utils/validacionesEmpleado'

const API_BASE_URL = 'http://localhost:8090'

function mapearRolUsuario(rolEmpleado) {
  return rolEmpleado === 'ADMINISTRADOR'
    ? 'ADMINISTRADOR'
    : 'EMPLEADO'
}

const empleadoVacio = {
  usuario: '',
  password: '',
  dni: '',
  nombre: '',
  apellido: '',
  rol: 'ENFERMERIA',
  email: '',
  telefono: '',
  direccion: '',
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

function FormularioCrearEmpleado({
  setPagina,
  empleadoEditar,
  setEmpleadoEditar,
}) {
  const esEdicion =
    empleadoEditar != null

  const [empleado, setEmpleado] =
    useState(
      empleadoEditar ?? empleadoVacio
    )

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

  useEffect(() => {
    if (empleadoEditar) {
      setEmpleado({
        usuario: '',
        password: '',
        ...empleadoEditar,
      })
    } else {
      setEmpleado(empleadoVacio)
    }

    /* Limpiar errores al cambiar entre creación y edición */
    setErrores({})
  }, [empleadoEditar])

  /**
   * Actualiza un campo del formulario y limpia
   * su error de validación asociado si existía.
   */
  const actualizarCampo = (
    campo,
    valor
  ) => {
    setEmpleado((empleadoActual) => ({
      ...empleadoActual,
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

  const volverAGestion = () => {
    setEmpleadoEditar(null)
    setPagina('GESTION EMPLEADOS')
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
      setEmpleado(empleadoVacio)
      setEmpleadoEditar(null)
      setPagina('GESTION EMPLEADOS')
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

  const guardarEmpleado = async (
    event
  ) => {
    event.preventDefault()

    if (guardando) {
      return
    }

    /* ── Validación frontend ── */
    const erroresValidacion =
      validarEmpleado(empleado, esEdicion)

    if (erroresValidacion) {
      setErrores(erroresValidacion)
      return
    }

    /* Limpiar errores previos antes de enviar */
    setErrores({})

    try {
      setGuardando(true)

      let response

      if (esEdicion) {
        response = await fetch(
          `${API_BASE_URL}/api/empleados/${empleado.dni}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              dni: Number(
                empleado.dni
              ),

              nombre:
                empleado.nombre.trim(),

              apellido:
                empleado.apellido.trim(),

              rol: empleado.rol,

              email:
                empleado.email?.trim() ??
                '',

              telefono:
                empleado.telefono === ''
                  ? 0
                  : Number(
                      empleado.telefono
                    ),

              direccion:
                empleado.direccion?.trim() ??
                '',

              /*
               * Conservamos usuarioId porque el
               * empleado ya está relacionado con
               * autenticacion-service.
               */
              usuarioId:
                empleado.usuarioId,
            }),
          }
        )
      } else {
        const requestBody = {
          usuario:
            empleado.usuario.trim(),

          password:
            empleado.password,

          rolUsuario:
            mapearRolUsuario(
              empleado.rol
            ),

          dni: Number(
            empleado.dni
          ),

          nombre:
            empleado.nombre.trim(),

          apellido:
            empleado.apellido.trim(),

          email:
            empleado.email.trim(),

          telefono:
            empleado.telefono === ''
              ? 0
              : Number(
                  empleado.telefono
                ),

          direccion:
            empleado.direccion.trim(),

          rolEmpleado:
            empleado.rol,
        }

        response = await fetch(
          `${API_BASE_URL}/auth/register`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify(
              requestBody
            ),
          }
        )
      }

      if (!response.ok) {
        /*
         * Intentar extraer errores de campo del backend
         * (usuario duplicado, DNI duplicado, validación Jakarta).
         * Si el backend devuelve errores estructurados,
         * se muestran inline y no se muestra el modal genérico.
         */
        const tieneErroresCampo =
          await procesarErroresBackend(
            response
          )

        if (!tieneErroresCampo) {
          throw new Error(
            esEdicion
              ? 'No se pudo modificar el empleado'
              : 'No se pudo crear el empleado'
          )
        }

        return
      }

      const contentType =
        response.headers.get(
          'content-type'
        )

      if (
        contentType?.includes(
          'application/json'
        )
      ) {
        const data =
          await response.json()

        console.log(
          'Empleado guardado:',
          data
        )
      }

      setModal({
        visible: true,
        tipo: 'exito',

        titulo: esEdicion
          ? 'Empleado modificado'
          : 'Empleado creado',

        mensaje: esEdicion
          ? 'El empleado se modificó con éxito.'
          : 'El empleado se creó con éxito.',

        volver: true,
      })
    } catch (error) {
      console.error(
        'Error al guardar empleado:',
        error
      )

      setModal({
        visible: true,
        tipo: 'error',
        titulo: 'Error',

        mensaje: esEdicion
          ? 'No se pudo modificar el empleado.'
          : 'No se pudo crear el empleado.',

        volver: false,
      })
    } finally {
      setGuardando(false)
    }
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
          {esEdicion
            ? 'Editar Empleado'
            : 'Registrar Nuevo Empleado'}
        </h3>

        <form
          className="admin-form-empleado"
          onSubmit={guardarEmpleado}
          noValidate
        >
          {!esEdicion && (
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label htmlFor="usuario">
                  Usuario
                </label>

                <input
                  id="usuario"
                  type="text"
                  className={claseInput(
                    errores.usuario
                  )}
                  placeholder="Ej: jperez"
                  value={empleado.usuario}
                  maxLength={
                    LIMITES.USUARIO_MAX
                  }
                  onChange={(event) =>
                    actualizarCampo(
                      'usuario',
                      event.target.value
                    )
                  }
                  required
                />

                {errores.usuario && (
                  <span className="admin-campo-error">
                    {errores.usuario}
                  </span>
                )}
              </div>

              <div className="admin-form-group">
                <label htmlFor="password">
                  Contraseña
                </label>

                <input
                  id="password"
                  type="password"
                  className={claseInput(
                    errores.password
                  )}
                  placeholder="Contraseña inicial"
                  value={empleado.password}
                  maxLength={
                    LIMITES.PASSWORD_MAX
                  }
                  onChange={(event) =>
                    actualizarCampo(
                      'password',
                      event.target.value
                    )
                  }
                  required
                />

                {errores.password && (
                  <span className="admin-campo-error">
                    {errores.password}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="nombre">
                Nombre
              </label>

              <input
                id="nombre"
                type="text"
                className={claseInput(
                  errores.nombre
                )}
                placeholder="Ej: Juan"
                value={empleado.nombre}
                maxLength={
                  LIMITES.NOMBRE_MAX
                }
                onChange={(event) =>
                  actualizarCampo(
                    'nombre',
                    event.target.value
                  )
                }
                required
              />

              {errores.nombre && (
                <span className="admin-campo-error">
                  {errores.nombre}
                </span>
              )}
            </div>

            <div className="admin-form-group">
              <label htmlFor="apellido">
                Apellido
              </label>

              <input
                id="apellido"
                type="text"
                className={claseInput(
                  errores.apellido
                )}
                placeholder="Ej: Pérez"
                value={empleado.apellido}
                maxLength={
                  LIMITES.APELLIDO_MAX
                }
                onChange={(event) =>
                  actualizarCampo(
                    'apellido',
                    event.target.value
                  )
                }
                required
              />

              {errores.apellido && (
                <span className="admin-campo-error">
                  {errores.apellido}
                </span>
              )}
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="dni">
                DNI
              </label>

              <input
                id="dni"
                type="text"
                inputMode="numeric"
                className={claseInput(
                  errores.dni
                )}
                placeholder="Ej: 42765715"
                value={empleado.dni}
                maxLength={
                  LIMITES.DNI_MAX_DIGITOS
                }
                disabled={esEdicion}
                onChange={(event) =>
                  actualizarCampo(
                    'dni',
                    event.target.value
                  )
                }
                required
              />

              {errores.dni && (
                <span className="admin-campo-error">
                  {errores.dni}
                </span>
              )}
            </div>

            <div className="admin-form-group">
              <label htmlFor="rol">
                Rol
              </label>

              <select
                id="rol"
                className="admin-input-estilo"
                value={empleado.rol}
                onChange={(event) =>
                  actualizarCampo(
                    'rol',
                    event.target.value
                  )
                }
                required
              >
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
          </div>

          <div className="admin-form-group">
            <label htmlFor="email">
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              className={claseInput(
                errores.email
              )}
              placeholder="email@hospital.com"
              value={
                empleado.email ?? ''
              }
              maxLength={
                LIMITES.EMAIL_MAX
              }
              onChange={(event) =>
                actualizarCampo(
                  'email',
                  event.target.value
                )
              }
              required
            />

            {errores.email && (
              <span className="admin-campo-error">
                {errores.email}
              </span>
            )}
          </div>

          <div className="admin-form-group">
            <label htmlFor="telefono">
              Teléfono
            </label>

            <input
              id="telefono"
              type="tel"
              inputMode="numeric"
              className={claseInput(
                errores.telefono
              )}
              placeholder="Ej: 3425123456"
              value={
                empleado.telefono ?? ''
              }
              maxLength={
                LIMITES.TELEFONO_MAX_DIGITOS
              }
              onChange={(event) =>
                actualizarCampo(
                  'telefono',
                  event.target.value
                )
              }
              required
            />

            {errores.telefono && (
              <span className="admin-campo-error">
                {errores.telefono}
              </span>
            )}
          </div>

          <div className="admin-form-group">
            <label htmlFor="direccion">
              Dirección{' '}
              <span
                style={{
                  color: '#666',
                  fontSize: '0.8rem',
                }}
              >
                (opcional)
              </span>
            </label>

            <input
              id="direccion"
              type="text"
              className={claseInput(
                errores.direccion
              )}
              placeholder="Ej: San Martín 123"
              value={
                empleado.direccion ?? ''
              }
              maxLength={
                LIMITES.DIRECCION_MAX
              }
              onChange={(event) =>
                actualizarCampo(
                  'direccion',
                  event.target.value
                )
              }
            />

            {errores.direccion && (
              <span className="admin-campo-error">
                {errores.direccion}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="admin-btn-guardar"
            disabled={guardando}
          >
            {guardando
              ? esEdicion
                ? 'Actualizando...'
                : 'Guardando...'
              : esEdicion
                ? 'Actualizar Empleado'
                : 'Guardar Empleado'}
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

export default FormularioCrearEmpleado