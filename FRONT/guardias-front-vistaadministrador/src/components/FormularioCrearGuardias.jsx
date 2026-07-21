import React, { useState } from "react";

function FormularioCrearGuardias({ setPagina }) {

  const [empleados, setEmpleados] = useState([]);

  const [guardia, setGuardia] = useState({
    fecha: "",
    horaInicio: "",
    horaFin: "",
    rol: "",
    empleadoId: ""
  });

  const cargarEmpleadosPorRol = async (rol) => {

    if (rol === "") {
      setEmpleados([]);
      return;
    }

    try {

      const response = await fetch(
        `http://localhost:8090/api/empleados?rol=${rol}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener empleados");
      }

      const data = await response.json();

      setEmpleados(data);

    } catch (error) {
      console.error(error);
    }

  };

  const guardarGuardia = async (e) => {

    e.preventDefault();

    try {

      const response = await fetch(
        "http://localhost:8090/api/guardias",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...guardia,
            empleadoId: guardia.empleadoId === "" ? null : Number(guardia.empleadoId)
          })
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo guardar la guardia");
      }

      alert("Guardia creada correctamente");

      setGuardia({
        fecha: "",
        horaInicio: "",
        horaFin: "",
        rol: "",
        empleadoId: ""
      });

      setEmpleados([]);

    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al guardar la guardia");
    }

  };

  return (
    <div className="form-container">

      <button
        className="btn-volver"
        onClick={() => setPagina("GESTION GUARDIAS")}
      >
        ← Volver
      </button>

      <h3 className="titulo-formulario">
        Crear Nueva Guardia
      </h3>

      <form className="form-generico" onSubmit={guardarGuardia}>

        <div className="form-group">
          <label>Fecha de la Guardia</label>

          <input
            type="date"
            className="input-estilo"
            value={guardia.fecha}
            onChange={(e) =>
              setGuardia({
                ...guardia,
                fecha: e.target.value
              })
            }
            required
          />
        </div>

        <div className="form-row">

          <div className="form-group">
            <label>Hora de Inicio</label>

            <input
              type="time"
              className="input-estilo"
              value={guardia.horaInicio}
              onChange={(e) =>
                setGuardia({
                  ...guardia,
                  horaInicio: e.target.value
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Hora de Fin</label>

            <input
              type="time"
              className="input-estilo"
              value={guardia.horaFin}
              onChange={(e) =>
                setGuardia({
                  ...guardia,
                  horaFin: e.target.value
                })
              }
              required
            />
          </div>

        </div>

        <div className="form-group">

          <label>Área de Trabajo</label>

          <select
            className="input-estilo"
            value={guardia.rol}
            onChange={(e) => {

              const rol = e.target.value;

              setGuardia({
                ...guardia,
                rol: rol,
                empleadoId: ""
              });

              cargarEmpleadosPorRol(rol);

            }}
            required
          >

            <option value="">Seleccione un área</option>
            <option value="ENFERMERIA">Enfermería</option>
            <option value="LIMPIEZA">Limpieza</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
            <option value="ADMINISTRADOR">Administrador</option>

          </select>

        </div>

        <div className="form-group">

          <label>Personal Asignado (Opcional)</label>

          <select
            className="input-estilo"
            value={guardia.empleadoId}
            onChange={(e) =>
              setGuardia({
                ...guardia,
                empleadoId: e.target.value === "" ? null : Number(e.target.value)
              })
            }
          >

            <option value="">
              Dejar sin asignar (Guardia Abierta)
            </option>

            {empleados.map((emp) => (
              <option
                key={emp.dni}
                value={emp.dni}
              >
                {emp.nombre} {emp.apellido}
              </option>
            ))}

          </select>

        </div>

        <button
          type="submit"
          className="btn-guardar"
        >
          Guardar Guardia
        </button>

      </form>

    </div>
  );
}

export default FormularioCrearGuardias;