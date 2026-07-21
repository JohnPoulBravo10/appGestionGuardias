import React, { useState } from "react";

/**
 * URL base del API Gateway.
 * En desarrollo apunta a localhost:8090; en Docker se reemplaza por el hostname interno.
 */
const API_BASE_URL = "http://localhost:8090";

/**
 * Mapea el rol funcional del empleado (select) al enum de usuario para autenticación.
 * "ADMINISTRADOR" → Rol.ADMINISTRADOR; cualquier otro → Rol.EMPLEADO.
 *
 * @param {string} rolEmpleado - Rol funcional seleccionado en el formulario
 * @returns {string} Valor del enum Rol para el servicio de autenticación
 */
function mapearRolUsuario(rolEmpleado) {
  return rolEmpleado === "ADMINISTRADOR" ? "ADMINISTRADOR" : "EMPLEADO";
}

/**
 * FormularioCrearEmpleado — Formulario para registrar un nuevo empleado.
 *
 * Ahora envía los datos a POST /auth/register en lugar de POST /api/empleados.
 * El servicio de autenticación crea el usuario (credenciales) y delega
 * la creación del perfil al empleado-service vía Feign.
 *
 * @param {Object} props
 * @param {Function} props.setPagina - Callback para navegar entre páginas
 */
function FormularioCrearEmpleado({ setPagina }) {

  const [empleado, setEmpleado] = useState({
    usuario: "",
    password: "",
    dni: "",
    nombre: "",
    apellido: "",
    rol: "ENFERMERIA",
    email: "",
    telefono: "",
    direccion: "",
  });

  /**
   * Envía los datos de registro al servicio de autenticación.
   * Construye el RegistroRequestDto esperado por el backend:
   * - usuario, password, rolUsuario (enum) → credenciales
   * - dni, nombre, apellido, email, telefono, direccion, rolEmpleado (string) → perfil
   */
  const guardarEmpleado = async (e) => {
    e.preventDefault();

    try {
      const requestBody = {
        // Datos de autenticación
        usuario: empleado.usuario,
        password: empleado.password,
        rolUsuario: mapearRolUsuario(empleado.rol),
        // Datos del perfil de empleado
        dni: Number(empleado.dni),
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        email: empleado.email,
        telefono: Number(empleado.telefono),
        direccion: empleado.direccion,
        rolEmpleado: empleado.rol,
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al registrar empleado");
      }

      const data = await response.json();

      console.log("Empleado registrado:", data);

      alert("Empleado registrado correctamente");

      setEmpleado({
        usuario: "",
        password: "",
        dni: "",
        nombre: "",
        apellido: "",
        rol: "ENFERMERIA",
        email: "",
        telefono: "",
        direccion: "",
      });

    } catch (error) {
      console.error(error);
      alert("No se pudo registrar el empleado: " + error.message);
    }
  };

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

        {/* Campos de autenticación */}
        <div className="form-row">
          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              className="input-estilo"
              placeholder="Ej: jperez"
              value={empleado.usuario}
              onChange={(e) =>
                setEmpleado({
                  ...empleado,
                  usuario: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              className="input-estilo"
              placeholder="Contraseña inicial"
              value={empleado.password}
              onChange={(e) =>
                setEmpleado({
                  ...empleado,
                  password: e.target.value,
                })
              }
              required
            />
          </div>
        </div>

        {/* Datos personales */}
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