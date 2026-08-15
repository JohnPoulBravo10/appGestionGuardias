import React, {
  useEffect,
  useState,
} from 'react'

import ModalMensaje from '../common/ui/ModalMensaje'

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
  }, [empleadoEditar])

  const actualizarCampo = (
    campo,
    valor
  ) => {
    setEmpleado((empleadoActual) => ({
      ...empleadoActual,
      [campo]: valor,
    }))
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

  const guardarEmpleado = async (
    event
  ) => {
    event.preventDefault()

    if (guardando) {
      return
    }

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
        throw new Error(
          esEdicion
            ? 'No se pudo modificar el empleado'
            : 'No se pudo crear el empleado'
        )
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
                  className="admin-input-estilo"
                  placeholder="Ej: jperez"
                  value={empleado.usuario}
                  onChange={(event) =>
                    actualizarCampo(
                      'usuario',
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="password">
                  Contraseña
                </label>

                <input
                  id="password"
                  type="password"
                  className="admin-input-estilo"
                  placeholder="Contraseña inicial"
                  value={empleado.password}
                  onChange={(event) =>
                    actualizarCampo(
                      'password',
                      event.target.value
                    )
                  }
                  required
                />
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
                className="admin-input-estilo"
                placeholder="Ej: Juan"
                value={empleado.nombre}
                onChange={(event) =>
                  actualizarCampo(
                    'nombre',
                    event.target.value
                  )
                }
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="apellido">
                Apellido
              </label>

              <input
                id="apellido"
                type="text"
                className="admin-input-estilo"
                placeholder="Ej: Pérez"
                value={empleado.apellido}
                onChange={(event) =>
                  actualizarCampo(
                    'apellido',
                    event.target.value
                  )
                }
                required
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="dni">
                DNI
              </label>

              <input
                id="dni"
                type="number"
                className="admin-input-estilo"
                placeholder="Ej: 42765715"
                value={empleado.dni}
                disabled={esEdicion}
                onChange={(event) =>
                  actualizarCampo(
                    'dni',
                    event.target.value
                  )
                }
                required
              />
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
              className="admin-input-estilo"
              placeholder="email@hospital.com"
              value={
                empleado.email ?? ''
              }
              onChange={(event) =>
                actualizarCampo(
                  'email',
                  event.target.value
                )
              }
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="telefono">
              Teléfono
            </label>

            <input
              id="telefono"
              type="tel"
              inputMode="numeric"
              className="admin-input-estilo"
              placeholder="Ej: 3425123456"
              value={
                empleado.telefono ?? ''
              }
              onChange={(event) =>
                actualizarCampo(
                  'telefono',
                  event.target.value
                )
              }
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="direccion">
              Dirección
            </label>

            <input
              id="direccion"
              type="text"
              className="admin-input-estilo"
              placeholder="Ej: San Martín 123"
              value={
                empleado.direccion ?? ''
              }
              onChange={(event) =>
                actualizarCampo(
                  'direccion',
                  event.target.value
                )
              }
            />
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