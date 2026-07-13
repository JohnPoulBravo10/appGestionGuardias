import React, { useState } from "react";

function FormularioCrearEmpleado({ setPagina }) {

  const guardarEmpleado = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:8090/api/empleados", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(empleado)
    });

    if (!response.ok) {
      throw new Error("Error al guardar empleado");
    }

    const data = await response.json();

    console.log("Empleado guardado:", data);

    alert("Empleado registrado correctamente");

    setEmpleado({
      dni: "",
      nombre: "",
      apellido: "",
      rol: "",
      email: "",
      telefono: "",
      direccion: ""
    });

  } catch (error) {
    console.error(error);
    alert("No se pudo registrar el empleado");
  }
};

  const [empleado, setEmpleado] = useState({
    dni: "",
    nombre: "",
    apellido: "",
    rol: "ENFERMERIA",
    email: "",
    telefono: "",
    direccion: ""
  });

  

  return (
    <div className="tabla-container">

      <button
        className="btn-volver"
        onClick={() => setPagina("GESTION EMPLEADOS")}
      >
        ← Volver
      </button>

      <h3 style={{ marginBottom: "25px", marginTop: "10px" }}>
        Registrar Nuevo Empleado
      </h3>

      <form className="form-empleado" onSubmit={guardarEmpleado}>

        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            className="input-estilo"
            placeholder="Ej: Juan"
            value={empleado.nombre}
            onChange={(e) =>
              setEmpleado({
                ...empleado,
                nombre: e.target.value,
              })
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Apellido</label>
          <input
            type="text"
            className="input-estilo"
            placeholder="Ej: Pérez"
            value={empleado.apellido}
            onChange={(e) =>
              setEmpleado({
                ...empleado,
                apellido: e.target.value,
              })
            }
            required
          />
        </div>

        <div className="form-row">

          <div className="form-group">
            <label>DNI</label>
            <input
              type="number"
              className="input-estilo"
              placeholder="Ej: 12345678"
              value={empleado.dni}
              onChange={(e) =>
                setEmpleado({
                  ...empleado,
                  dni: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Rol</label>
            <select
              className="input-estilo"
              value={empleado.rol}
              onChange={(e) =>
                setEmpleado({
                  ...empleado,
                  rol: e.target.value,
                })
              }
            >
              <option value="ENFERMERIA">Enfermería</option>
              <option value="LIMPIEZA">Limpieza</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
          </div>

        </div>

        <div className="form-group">
          <label>Correo Electrónico</label>
          <input
            type="email"
            className="input-estilo"
            placeholder="email@hospital.com"
            value={empleado.email}
            onChange={(e) =>
              setEmpleado({
                ...empleado,
                email: e.target.value,
              })
            }
          />
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input
            type="number"
            className="input-estilo"
            placeholder="Ej: 3425123456"
            value={empleado.telefono}
            onChange={(e) =>
              setEmpleado({
                ...empleado,
                telefono: e.target.value,
              })
            }
          />
        </div>

        <div className="form-group">
          <label>Dirección</label>
          <input
            type="text"
            className="input-estilo"
            placeholder="Ej: San Martín 123"
            value={empleado.direccion}
            onChange={(e) =>
              setEmpleado({
                ...empleado,
                direccion: e.target.value,
              })
            }
          />
        </div>

        <button type="submit" className="btn-guardar">
          Guardar Empleado
        </button>

      </form>
    </div>
  );
}

export default FormularioCrearEmpleado;