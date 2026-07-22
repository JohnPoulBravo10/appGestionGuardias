import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:8090";

function mapearRolUsuario(rolEmpleado) {
  return rolEmpleado === "ADMINISTRADOR"
    ? "ADMINISTRADOR"
    : "EMPLEADO";
}

const empleadoVacio = {
  usuario: "",
  password: "",
  dni: "",
  nombre: "",
  apellido: "",
  rol: "ENFERMERIA",
  email: "",
  telefono: "",
  direccion: "",
};

function FormularioCrearEmpleado({
  setPagina,
  empleadoEditar,
  setEmpleadoEditar,
}) {
  const esEdicion = empleadoEditar != null;

  const [empleado, setEmpleado] = useState(
    empleadoEditar ?? empleadoVacio
  );

  useEffect(() => {
    if (empleadoEditar) {
      setEmpleado({
        usuario: "",
        password: "",
        ...empleadoEditar,
      });
    } else {
      setEmpleado(empleadoVacio);
    }
  }, [empleadoEditar]);

  const actualizarCampo = (campo, valor) => {
    setEmpleado((empleadoActual) => ({
      ...empleadoActual,
      [campo]: valor,
    }));
  };

  const volverAGestion = () => {
    setEmpleadoEditar(null);
    setPagina("GESTION DE EMPLEADOS");
  };

  const guardarEmpleado = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (esEdicion) {
        response = await fetch(
          `${API_BASE_URL}/api/empleados/${empleado.dni}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              dni: Number(empleado.dni),
              nombre: empleado.nombre,
              apellido: empleado.apellido,
              rol: empleado.rol,
              email: empleado.email,
              telefono:
                empleado.telefono === ""
                  ? 0
                  : Number(empleado.telefono),
              direccion: empleado.direccion,
            }),
          }
        );
      } else {
        const requestBody = {
          usuario: empleado.usuario.trim(),
          password: empleado.password,
          rolUsuario: mapearRolUsuario(empleado.rol),
          dni: Number(empleado.dni),
          nombre: empleado.nombre.trim(),
          apellido: empleado.apellido.trim(),
          email: empleado.email.trim(),
          telefono:
            empleado.telefono === ""
              ? 0
              : Number(empleado.telefono),
          direccion: empleado.direccion.trim(),
          rolEmpleado: empleado.rol,
        };

        response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText ||
          "Error al procesar la solicitud del empleado"
        );
      }

      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        const data = await response.json();
        console.log("Empleado guardado:", data);
      }

      alert(
        esEdicion
          ? "Empleado actualizado correctamente"
          : "Empleado registrado correctamente"
      );

      setEmpleado(empleadoVacio);
      setEmpleadoEditar(null);
      setPagina("GESTION DE EMPLEADOS");
    } catch (error) {
      console.error(error);

      alert(
        "No se pudo completar la operación: " +
        error.message
      );
    }
  };

  return (
    <div className="form-container">
      <button
        type="button"
        className="btn-volver"
        onClick={volverAGestion}
      >
        ← Volver
      </button>

      <h3 className="titulo-formulario">
        {esEdicion
          ? "Editar Empleado"
          : "Registrar Nuevo Empleado"}
      </h3>

      <form
        className="form-empleado"
        onSubmit={guardarEmpleado}
      >
        {!esEdicion && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="usuario">
                Usuario
              </label>

              <input
                id="usuario"
                type="text"
                className="input-estilo"
                placeholder="Ej: jperez"
                value={empleado.usuario}
                onChange={(e) =>
                  actualizarCampo(
                    "usuario",
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                className="input-estilo"
                placeholder="Contraseña inicial"
                value={empleado.password}
                onChange={(e) =>
                  actualizarCampo(
                    "password",
                    e.target.value
                  )
                }
                required
              />
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre">
              Nombre
            </label>

            <input
              id="nombre"
              type="text"
              className="input-estilo"
              placeholder="Ej: Juan"
              value={empleado.nombre}
              onChange={(e) =>
                actualizarCampo(
                  "nombre",
                  e.target.value
                )
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="apellido">
              Apellido
            </label>

            <input
              id="apellido"
              type="text"
              className="input-estilo"
              placeholder="Ej: Pérez"
              value={empleado.apellido}
              onChange={(e) =>
                actualizarCampo(
                  "apellido",
                  e.target.value
                )
              }
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dni">
              DNI
            </label>

            <input
              id="dni"
              type="number"
              className="input-estilo"
              placeholder="Ej: 42765715"
              value={empleado.dni}
              disabled={esEdicion}
              onChange={(e) =>
                actualizarCampo(
                  "dni",
                  e.target.value
                )
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="rol">
              Rol
            </label>

            <select
              id="rol"
              className="input-estilo"
              value={empleado.rol}
              onChange={(e) =>
                actualizarCampo(
                  "rol",
                  e.target.value
                )
              }
              required
            >
              <option value="ENFERMERIA">
                Enfermería
              </option>

              <option value="LIMPIEZA">
                Limpieza
              </option>

              <option value="MANTENIMIENTO">
                Mantenimiento
              </option>

              <option value="ADMINISTRADOR">
                Administrador
              </option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">
            Correo electrónico
          </label>

          <input
            id="email"
            type="email"
            className="input-estilo"
            placeholder="email@hospital.com"
            value={empleado.email ?? ""}
            onChange={(e) =>
              actualizarCampo(
                "email",
                e.target.value
              )
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor="telefono">
            Teléfono
          </label>

          <input
            id="telefono"
            type="tel"
            inputMode="numeric"
            className="input-estilo"
            placeholder="Ej: 3425123456"
            value={empleado.telefono ?? ""}
            onChange={(e) =>
              actualizarCampo(
                "telefono",
                e.target.value
              )
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor="direccion">
            Dirección
          </label>

          <input
            id="direccion"
            type="text"
            className="input-estilo"
            placeholder="Ej: San Martín 123"
            value={empleado.direccion ?? ""}
            onChange={(e) =>
              actualizarCampo(
                "direccion",
                e.target.value
              )
            }
          />
        </div>

        <button
          type="submit"
          className="btn-guardar"
        >
          {esEdicion
            ? "Actualizar Empleado"
            : "Guardar Empleado"}
        </button>
      </form>
    </div>
  );
}

export default FormularioCrearEmpleado;