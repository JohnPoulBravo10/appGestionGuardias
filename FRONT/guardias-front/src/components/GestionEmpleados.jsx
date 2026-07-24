import React, { useEffect, useMemo, useState } from 'react'

function GestionEmpleados({
  setPagina,
  setEmpleadoEditar,
}) {
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)

  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [orden, setOrden] = useState('dniAsc')
  const [filtroRol, setFiltroRol] = useState('TODOS')

  const fetchEmpleados = async () => {
    try {
      setLoading(true)

      const response = await fetch(
        'http://localhost:8090/api/empleados'
      )

      if (!response.ok) {
        throw new Error('Error al obtener empleados')
      }

      const data = await response.json()
      setEmpleados(data)
    } catch (error) {
      console.error('Error:', error)
      alert('No se pudo conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpleados()
  }, [])

  const empleadosVisibles = useMemo(() => {
    const textoNormalizado = textoBusqueda
      .trim()
      .toLowerCase()

    const empleadosFiltrados = empleados.filter(
      (empleado) => {
        const nombreCompleto =
          `${empleado.nombre} ${empleado.apellido}`.toLowerCase()

        const dni = String(empleado.dni)

        const coincideBusqueda =
          !textoNormalizado ||
          nombreCompleto.includes(textoNormalizado) ||
          dni.includes(textoNormalizado)

        const coincideRol =
          filtroRol === 'TODOS' ||
          empleado.rol === filtroRol

        return coincideBusqueda && coincideRol
      }
    )

    return [...empleadosFiltrados].sort((a, b) => {
      const nombreCompletoA =
        `${a.nombre} ${a.apellido}`

      const nombreCompletoB =
        `${b.nombre} ${b.apellido}`

      switch (orden) {
        case 'dniAsc':
          return Number(a.dni) - Number(b.dni)

        case 'dniDesc':
          return Number(b.dni) - Number(a.dni)

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
          return String(a.rol).localeCompare(
            String(b.rol),
            'es'
          )

        case 'rolDesc':
          return String(b.rol).localeCompare(
            String(a.rol),
            'es'
          )

        default:
          return 0
      }
    })
  }, [
    empleados,
    textoBusqueda,
    filtroRol,
    orden,
  ])

  const editarEmpleado = (empleado) => {
    setEmpleadoEditar(empleado)
    setPagina('CREAR EMPLEADO')
  }

  const eliminarEmpleado = async (dni) => {
    const confirmar = window.confirm(
      '¿Está seguro que desea eliminar este empleado?'
    )

    if (!confirmar) {
      return
    }

    try {
      const response = await fetch(
        `http://localhost:8090/api/empleados/${dni}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Error al eliminar empleado')
      }

      alert('Empleado eliminado correctamente')

      /*
       * Lo sacamos directamente del estado para evitar
       * hacer otra petición completa al backend.
       */
      setEmpleados((empleadosActuales) =>
        empleadosActuales.filter(
          (empleado) => empleado.dni !== dni
        )
      )
    } catch (error) {
      console.error('Error:', error)
      alert('No se pudo eliminar el empleado')
    }
  }

  return (
    <div className="tabla-container">
      <div className="header-tabla">
        <h3>Gestión de Empleados</h3>

        <button
          type="button"
          className="btn-nuevo"
          onClick={() => {
            setEmpleadoEditar(null)
            setPagina('CREAR EMPLEADO')
          }}
        >
          + Nuevo Empleado
        </button>
      </div>

      <div className="filtrosOrdenEmpleados">
        <input
          type="text"
          className="input-busqueda"
          placeholder="🔍 Buscar por nombre o DNI..."
          value={textoBusqueda}
          onChange={(event) =>
            setTextoBusqueda(event.target.value)
          }
        />

        <select
          value={filtroRol}
          onChange={(event) =>
            setFiltroRol(event.target.value)
          }
          className="input-estilo"
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

          <option value="SERVICIO_GENERAL">
            Servicio General
          </option>
        </select>

        <select
          value={orden}
          onChange={(event) =>
            setOrden(event.target.value)
          }
          className="input-estilo"
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
        <p className="contador-empleados">
          Mostrando {empleadosVisibles.length} de{' '}
          {empleados.length} empleados
        </p>
      )}

      {loading ? (
        <p>Cargando empleados...</p>
      ) : empleadosVisibles.length === 0 ? (
        <p>No se encontraron empleados.</p>
      ) : (
        <table className="tabla-empleados">
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
            {empleadosVisibles.map((empleado) => (
              <tr key={empleado.dni}>
                <td>{empleado.dni}</td>

                <td>
                  {empleado.nombre}{' '}
                  {empleado.apellido}
                </td>

                <td>{empleado.rol}</td>

                <td>{empleado.email}</td>

                <td>{empleado.telefono}</td>

                <td>{empleado.direccion}</td>

                <td className="acciones-empleado">
                  <button
                    type="button"
                    className="accion-editar"
                    onClick={() =>
                      editarEmpleado(empleado)
                    }
                  >
                    ✎ Editar
                  </button>

                  <button
                    type="button"
                    className="accion-eliminar"
                    onClick={() =>
                      eliminarEmpleado(empleado.dni)
                    }
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default GestionEmpleados