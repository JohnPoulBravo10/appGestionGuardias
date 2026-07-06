import React from 'react'

function MisGuardias() {
  
    const guardias = [
    { fecha: 'Mañana, 27/05/2026', horario: '08:00 a 16:00', area: 'Enfermería', estado: 'Próxima' },
    { fecha: 'Jueves, 28/05/2026', horario: '08:00 a 16:00', area: 'Enfermería', estado: 'Confirmada' },
  ];

  return (
    <div className="tabla-container">
      <h3 style={{ marginBottom: '20px' }}>MIS GUARDIAS</h3>
      <table className="tabla-guardias">
        <thead>
          <tr>
            <th>FECHA</th>
            <th>HORARIO</th>
            <th>AREA</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {guardias.map((g, i) => (
            <tr key={i}>
              <td>{g.fecha}</td>
              <td>{g.horario}</td>
              <td>{g.area}</td>
              <td>{g.estado}</td>
              <td style={{ color: '#aaa', cursor: 'pointer' }}>Solicitar cambio</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MisGuardias