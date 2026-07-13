import React, { useState, useEffect } from 'react';

function FormularioCrearGuardias({ setPagina }) {
  const [empleados, setEmpleados] = useState([]);

  // Cargamos los empleados desde el backend al cargar el formulario
  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const response = await fetch("http://localhost:8090/api/empleados");
        if (response.ok) {
          const data = await response.json();
          setEmpleados(data);
        }
      } catch (error) {
        console.error("Error al cargar empleados:", error);
      }
    };
    fetchEmpleados();
  }, []);

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
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nombre} {emp.apellido}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-guardar">Guardar Guardia</button>
      </form>
    </div>
  );
}

export default FormularioCrearGuardias;