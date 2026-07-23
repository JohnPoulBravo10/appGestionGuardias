import React, { useState, useEffect } from 'react';

function GestionEmpleados({ setPagina, setEmpleadoEditar }) {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener empleados del backend
  const fetchEmpleados = async () => {
    try {
      const response = await fetch("http://localhost:8090/api/empleados");
      if (!response.ok) throw new Error("Error al obtener empleados");
      const data = await response.json();
      setEmpleados(data);
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const editarEmpleado = (empleado) => {

    setEmpleadoEditar(empleado);

    setPagina("CREAR EMPLEADO");

  };
  const eliminarEmpleado = async (id) => {

    const confirmar = window.confirm(
      "¿Está seguro que desea eliminar este empleado?"
    );

    if (!confirmar) return;

    try {

      const response = await fetch(
        `http://localhost:8090/api/empleados/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar empleado");
      }

      alert("Empleado eliminado correctamente");


      fetchEmpleados();

    } catch (error) {

      console.error("Error:", error);
      alert("No se pudo eliminar el empleado");

    }

  };

  return (
    <div className="tabla-container">
      <div className="header-tabla">
        <h3>Gestión de Empleados</h3>
        <button
          className="btn-nuevo"
          onClick={() => {
            setEmpleadoEditar(null);
            setPagina("CREAR EMPLEADO");
          }}
        >
          + Nuevo Empleado
        </button>
      </div>

      <input type="text" placeholder="🔍 Buscar por nombre o DNI..." className="input-busqueda" />

      {loading ? <p>Cargando empleados...</p> : (
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
            {empleados.map((e) => (
              <tr key={e.dni}>
                <td>{e.dni}</td>
                <td>{e.nombre} {e.apellido}</td>
                <td>{e.rol}</td>
                <td>{e.email}</td>
                <td>{e.telefono}</td>
                <td>{e.direccion}</td>
                <td className="accion-editar" onClick={() => editarEmpleado(e)}>✎ Editar</td>
                <td className="accion-editar" onClick={() => eliminarEmpleado(e.dni)}> Eliminar</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}


export default GestionEmpleados