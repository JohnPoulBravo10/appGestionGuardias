import React, { useEffect, useState } from "react";

function GestionGuardias({ setPagina, setGuardiaEditar }) {
  const [guardias, setGuardias] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    console.log("GestionGuardias cargado");
    obtenerGuardias();
}, []);

 
  

 

  const obtenerGuardias = async () => {
    try {
      const response = await fetch("http://localhost:8090/api/guardias");

      if (!response.ok) {
        throw new Error("Error al obtener guardias");
      }

      const data = await response.json();

      setGuardias(data);

    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const eliminarGuardia = async (id) => {
  
  

    const confirmar = window.confirm(
      "¿Está seguro que desea eliminar esta guardia?"
    );

    if (!confirmar) return;

    try {

      const response = await fetch(
        `http://localhost:8090/api/guardias/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar guardia");
      }

      alert("Guardia eliminada correctamente");


      obtenerGuardias();

    } catch (error) {

      console.error("Error:", error);
      alert("No se pudo eliminar la guardia");

    }

  };


  const editarGuardia = (guardia) => {


    setGuardiaEditar(guardia)
    setPagina('EDITAR GUARDIA')

  }

  return (
    <div className="tabla-container">
      <div className="header-tabla">
        <h3>Gestión de Guardias</h3>
        <button className="btn-nuevo" onClick={() => setPagina('CREAR GUARDIAS')}>+ Crear Guardia</button>
      </div>

    {loading ? <p>Cargando empleados...</p> : (
      <table className="tabla-guardias">
        <thead>
          <tr>
            <th>FECHA</th>
            <th>HORARIO</th>
            <th>ÁREA</th>
            <th>PERSONAL ASIGNADO</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {
            guardias.map((g) => (
              <tr key={g.id}>

                <td>{g.fecha}</td>

                <td>
                  {g.horaInicio} - {g.horaFin}
                </td>

                <td>{g.rol}</td>

                <td>{g.empleadoId ?? "Sin asignar"}</td>

                <td>
                  <span className="badge">
                    {g.estado}
                  </span>
                </td>

                <td className="accion-editar" onClick={() => editarGuardia(g)}>
                  ✎ Editar
                </td>
                <td className="accion-editar" onClick={() => eliminarGuardia(g.id)}>
                  ✎ Eliminar
                </td>

              </tr>
            ))
          }
        </tbody>
      </table>
      )}
    </div>
  );
}

export default GestionGuardias