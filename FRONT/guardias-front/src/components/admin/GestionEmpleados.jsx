import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import ModalConfirmacion from '../common/ui/ModalConfirmacion'
import ModalMensaje from '../common/ui/ModalMensaje'

const API_BASE_URL = 'http://localhost:8090'

function GestionEmpleados({
  setPagina,
  setEmpleadoEditar,
}) {
  const [empleados, setEmpleados] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [textoBusqueda, setTextoBusqueda] =
    useState('')

  const [orden, setOrden] =
    useState('dniAsc')

  const [filtroRol, setFiltroRol] =
    useState('TODOS')

  const [
    empleadoAEliminar,
    setEmpleadoAEliminar,
  ] = useState(null)

  const [modal, setModal] = useState({
    visible: false,
    tipo: 'exito',
    titulo: '',
    mensaje: '',
  })

  const fetchEmpleados = async () => {
    try {
      setLoading(true)

      const response = await fetch(
        `${API_BASE_URL}/api/empleados`
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
        'Error al obtener empleados:',
        error
      )

      setModal({
        visible: true,
        tipo: 'error',
        titulo: 'Error',
        mensaje:
          'No se pudieron cargar los empleados.',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpleados()
  }, [])

  const empleadosVisibles = useMemo(() => {
    const textoNormalizado =
      textoBusqueda
        .trim()
        .toLowerCase()

    const empleadosFiltrados =
      empleados.filter((empleado) => {
        const nombreCompleto =
          `${empleado.nombre} ${empleado.apellido}`
            .toLowerCase()

        const dni = String(
          empleado.dni
        )

        const coincideBusqueda =
          !textoNormalizado ||
          nombreCompleto.includes(
            textoNormalizado
          ) ||
          dni.includes(
            textoNormalizado
          )

        const coincideRol =
          filtroRol === 'TODOS' ||
          empleado.rol === filtroRol

        return (
          coincideBusqueda &&
          coincideRol
        )
      })

    return [...empleadosFiltrados].sort(
      (a, b) => {
        const nombreCompletoA =
          `${a.nombre} ${a.apellido}`

        const nombreCompletoB =
          `${b.nombre} ${b.apellido}`

        switch (orden) {
          case 'dniAsc':
            return (
              Number(a.dni) -
              Number(b.dni)
            )

          case 'dniDesc':
            return (
              Number(b.dni) -
              Number(a.dni)
            )

          case 'nombreAsc':
            return nombreCompletoA.localeCompare(
              nombreCompletoB,
              'es'
            )

          case 'nombreDesc':
            return nombreCompletoB.localeCompare(
              nombreCompletoA,
              'es'
            )

          case 'rolAsc':
            return String(
              a.rol
            ).localeCompare(
              String(b.rol),
              'es'
            )

          case 'rolDesc':
            return String(
              b.rol
            ).localeCompare(
              String(a.rol),
              'es'
            )

          default:
            return 0
        }
      }
    )
  }, [
    empleados,
    textoBusqueda,
    filtroRol,
    orden,
  ])

  const editarEmpleado = (
    empleado
  ) => {
    setEmpleadoEditar(empleado)
    setPagina('CREAR EMPLEADO')
  }

  const solicitarEliminarEmpleado = (
    empleado
  ) => {
    setEmpleadoAEliminar(empleado)
  }

  const cancelarEliminacion = () => {
    setEmpleadoAEliminar(null)
  }

  const confirmarEliminacion =
    async () => {
      if (!empleadoAEliminar) {
        return
      }

      const dni =
        empleadoAEliminar.dni

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/empleados/${dni}`,
          {
            method: 'DELETE',
          }
        )

        if (!response.ok) {
          throw new Error(
            'Error al eliminar empleado'
          )
        }

        setEmpleadoAEliminar(null)

        setEmpleados(
          (empleadosActuales) =>
            empleadosActuales.filter(
              (empleado) =>
                empleado.dni !== dni
            )
        )

        setModal({
          visible: true,
          tipo: 'exito',
          titulo: 'Empleado dado de baja',
          mensaje:
            'El empleado se dio de baja con éxito.',
        })
      } catch (error) {
        console.error(
          'Error al eliminar empleado:',
          error
        )

        setEmpleadoAEliminar(null)

        setModal({
          visible: true,
          tipo: 'error',
          titulo: 'Error',
          mensaje:
            'No se pudo dar de baja al empleado.',
        })
      }
    }

  const cerrarModalMensaje = () => {
    setModal((modalActual) => ({
      ...modalActual,
      visible: false,
    }))
  }

  return (
    <>
      <div className="admin-tabla-container">
        <div className="admin-header-tabla">
          <h3>
            Gestión de Empleados
          </h3>

          <button
            type="button"
            className="admin-btn-nuevo"
            onClick={() => {
              setEmpleadoEditar(null)
              setPagina(
                'CREAR EMPLEADO'
              )
            }}
          >
            + Nuevo Empleado
          </button>
        </div>

        <div className="admin-filtros-orden">
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
            value={filtroRol}
            onChange={(event) =>
              setFiltroRol(
                event.target.value
              )
            }
            className="admin-input-estilo"
            aria-label="Filtrar empleados por área"
          >
            <option value="TODOS">
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
            value={orden}
            onChange={(event) =>
              setOrden(
                event.target.value
              )
            }
            className="admin-input-estilo"
            aria-label="Ordenar empleados"
          >
            <option value="dniAsc">
              DNI menor a mayor
            </option>

            <option value="dniDesc">
              DNI mayor a menor
            </option>

            <option value="nombreAsc">
              Nombre A-Z
            </option>

            <option value="nombreDesc">
              Nombre Z-A
            </option>

            <option value="rolAsc">
              Área A-Z
            </option>

            <option value="rolDesc">
              Área Z-A
            </option>
          </select>
        </div>

        {!loading && (
          <p className="admin-contador-empleados">
            Mostrando{' '}
            {empleadosVisibles.length} de{' '}
            {empleados.length} empleados
          </p>
        )}

        {loading ? (
          <p>
            Cargando empleados...
          </p>
        ) : empleadosVisibles.length ===
          0 ? (
          <p>
            No se encontraron empleados.
          </p>
        ) : (
          <table className="admin-tabla-empleados">
            <thead>
              <tr>
                <th>DNI</th>
                <th>NOMBRE</th>
                <th>ROL</th>
                <th>EMAIL</th>
                <th>TELÉFONO</th>
                <th>DIRECCIÓN</th>
                <th>ACCIONES</th>
              </tr>
            </thead>

            <tbody>
              {empleadosVisibles.map(
                (empleado) => (
                  <tr
                    key={empleado.dni}
                  >
                    <td>
                      {empleado.dni}
                    </td>

                    <td>
                      {empleado.nombre}{' '}
                      {empleado.apellido}
                    </td>

                    <td>
                      {empleado.rol}
                    </td>

                    <td>
                      {empleado.email}
                    </td>

                    <td>
                      {empleado.telefono}
                    </td>

                    <td>
                      {empleado.direccion}
                    </td>

                    <td className="admin-acciones">
                      <button
                        type="button"
                        className="admin-accion-editar"
                        onClick={() =>
                          editarEmpleado(
                            empleado
                          )
                        }
                      >
                        ✎ Editar
                      </button>

                      <button
                        type="button"
                        className="admin-accion-eliminar"
                        onClick={() =>
                          solicitarEliminarEmpleado(
                            empleado
                          )
                        }
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      <ModalConfirmacion
        visible={
          empleadoAEliminar !== null
        }
        titulo="Dar de baja empleado"
        mensaje={
          empleadoAEliminar
            ? `¿Desea dar de baja a ${empleadoAEliminar.nombre} ${empleadoAEliminar.apellido}, DNI ${empleadoAEliminar.dni}? Esta acción desactivará al empleado, liberará sus guardias futuras y cancelará sus solicitudes pendientes.`
            : ''
        }
        onConfirmar={
          confirmarEliminacion
        }
        onCancelar={
          cancelarEliminacion
        }
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

export default GestionEmpleados