import React, { useEffect, useState } from "react";

function GestionGuardias({ setPagina }) {
  const guardias = [
    { fecha: '28/05/2026', horario: '08:00 - 16:00', area: 'Enfermería UTI', personal: 'Ana Martínez', estado: 'Programada' },
    { fecha: '28/05/2026', horario: '16:00 - 00:00', area: 'Urgencias', personal: 'Roberto Gómez, Carlos Ruiz', estado: 'Programada' },
    { fecha: '29/05/2026', horario: '00:00 - 08:00', area: 'Enfermería UTI', personal: 'Sin asignar cobertura', estado: 'Incompleta' },
  ];

  return (
    <div className="tabla-container">
      <div className="header-tabla">
        <h3>Gestión de Guardias</h3>
        <button className="btn-nuevo" onClick={() => setPagina('CREAR GUARDIAS')}>+ Crear Guardia</button>
      </div>
      
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
          {guardias.map((g, i) => (
            <tr key={i} className={g.estado === 'Incompleta' ? 'fila-alerta' : ''}>
              <td>📅 {g.fecha}</td>
              <td>🕒 {g.horario}</td>
              <td>{g.area}</td>
              <td>{g.estado === 'Incompleta' ? <span style={{color: '#f44336'}}>👤 {g.personal}</span> : `👤 ${g.personal}`}</td>
              <td><span className={`badge ${g.estado.toLowerCase()}`}>● {g.estado}</span></td>
              <td className="accion-editar">✎ {g.estado === 'Incompleta' ? 'Asignar Personal' : 'Editar'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GestionGuardias