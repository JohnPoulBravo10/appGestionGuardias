import React from 'react'

function GestionEmpleados({ setPagina }) {
  const empleados = [
    { nombre: 'Ana Martínez', rol: 'Enfermera', area: 'UTI', estado: 'Activo' },
    { nombre: 'Roberto Gómez', rol: 'Médico de Guardia', area: 'Urgencias', estado: 'Activo' },
    { nombre: 'Lucía Fernández', rol: 'Personal de Limpieza', area: 'Servicios Generales', estado: 'Inactivo' },
  ];

  return (
    <div className="tabla-container">
      <div className="header-tabla">
        <h3>Gestión de Empleados</h3>
        <button className="btn-nuevo" onClick={() => setPagina('CREAR EMPLEADO')}>+ Nuevo Empleado</button>
      </div>
      
      <input type="text" placeholder="🔍 Buscar por nombre o DNI..." className="input-busqueda" />

      <table className="tabla-empleados">
        <thead>
          <tr>
            <th>NOMBRE</th>
            <th>ROL</th>
            <th>ÁREA</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((e, i) => (
            <tr key={i}>
              <td>{e.nombre}</td>
              <td>{e.rol}</td>
              <td>{e.area}</td>
              <td>
                <span className={`badge ${e.estado.toLowerCase()}`}>● {e.estado}</span>
              </td>
              <td className="accion-editar">✎ Editar</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


export default GestionEmpleados