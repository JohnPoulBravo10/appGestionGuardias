import React from 'react'

function FormularioCrearEmpleado({ setPagina }) {
  return (
    <div className="tabla-container">
      <button className="btn-volver" onClick={() => setPagina('GESTION EMPLEADOS')}>← Volver</button>
      <h3 style={{ marginBottom: '25px', marginTop: '10px' }}>Registrar Nuevo Empleado</h3>
      
      <form className="form-empleado" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label>Nombre Completo</label>
          <input type="text" className="input-estilo" placeholder="Ej: Juan Pérez" required />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>DNI</label>
            <input type="text" className="input-estilo" placeholder="Ej: 12345678" required />
          </div>
          <div className="form-group">
            <label>Rol</label>
            <select className="input-estilo">
              <option>Enfermero/a</option>
              <option>Médico/a</option>
              <option>Administrativo/a</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Área de Trabajo</label>
          <input type="text" className="input-estilo" placeholder="Ej: UTI, Urgencias..." />
        </div>

        <div className="form-group">
          <label>Correo Electrónico</label>
          <input type="email" className="input-estilo" placeholder="email@hospital.com" />
        </div>

        <button type="submit" className="btn-guardar">Guardar Empleado</button>
      </form>
    </div>
  );
}

export default FormularioCrearEmpleado