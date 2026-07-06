import React from 'react'

function FormularioCrearGuardias({ setPagina }) {
  return (
    <div className="form-container">
      <button className="btn-volver" onClick={() => setPagina('GESTION GUARDIAS')}>← Volver</button>
      <h3 className="titulo-formulario">Crear Nueva Guardia</h3>
      
      <form className="form-generico" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label>Fecha de la Guardia</label>
          <input type="date" className="input-estilo" required />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Hora de Inicio</label>
            <input type="time" className="input-estilo" required />
          </div>
          <div className="form-group">
            <label>Hora de Fin</label>
            <input type="time" className="input-estilo" required />
          </div>
        </div>

        <div className="form-group">
          <label>Área de Trabajo</label>
          <select className="input-estilo">
            <option value="">Seleccione el área...</option>
            <option>Enfermería UTI</option>
            <option>Urgencias</option>
            <option>Servicios Generales</option>
          </select>
        </div>

        <div className="form-group">
          <label>Personal Asignado (Opcional)</label>
          <select className="input-estilo">
            <option value="">Dejar sin asignar (Guardia Abierta)</option>
            <option>Ana Martínez</option>
            <option>Roberto Gómez</option>
            <option>Lucía Fernández</option>
          </select>
        </div>

        <button type="submit" className="btn-guardar">Guardar Guardia</button>
      </form>
    </div>
  );
}

export default FormularioCrearGuardias