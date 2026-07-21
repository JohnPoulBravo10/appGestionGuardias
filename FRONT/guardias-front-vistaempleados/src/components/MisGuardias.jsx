import React, { useEffect, useState } from "react";


function MisGuardias() {
    const [loading, setLoading] = useState(true);
    const [guardias,setGuardias] = useState([]);
    useEffect(() => {
    obtenerGuardias(42765715);
}, []);

 const obtenerGuardias = async (id) => {

    setLoading(true);

    try {

        const response = await fetch(
            `http://localhost:8090/api/guardias/empleado/${id}`
        );

        if (!response.ok) {
            throw new Error("Error al obtener guardias");
        }

        const data = await response.json();

        setGuardias(data);

    } catch (error) {

        console.error(error);

    } finally {

        setLoading(false);

    }
};

  return (
    <div className="tabla-container">
      <h3 style={{ marginBottom: '20px' }}>MIS GUARDIAS</h3>
      {loading ? <p>Cargando guardias...</p> : (
      <table className="tabla-guardias">
        <thead>
          <tr>
            <th>FECHA</th>
            <th>HORARIO</th>
            <th>ÁREA</th>
            <th>ESTADO</th>
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


                <td>
                  <span className="badge">
                    {g.estado}
                  </span>
                </td>


              </tr>
            ))
          }
        </tbody>
      </table>
      )}
    </div>
  )
}

export default MisGuardias