import React, { useEffect, useState } from "react";

function EditarGuardia({ setPagina, guardiaEditar, setGuardiaEditar }) {

    const [empleados, setEmpleados] = useState([]);



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



    useEffect(() => {

        if (guardiaEditar?.rol) {
            cargarEmpleadosPorRol(guardiaEditar.rol);
        }

    }, [guardiaEditar]);



    const guardarGuardia = async (e) => {

        e.preventDefault();

        try {

            const response = await fetch(

                `http://localhost:8090/api/guardias/${guardiaEditar.id}`,

                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(guardiaEditar)
                }

            );

            if (!response.ok) {
                throw new Error("No se pudo guardar la guardia");
            }

            alert("Guardia editada correctamente");

            setPagina("GESTION DE GUARDIAS");

        } catch (error) {

            console.error(error);
            alert("Ocurrió un error");

        }

    };



    if (!guardiaEditar) {
        return <p>Cargando...</p>;
    }

    return (

        <div className="form-container">

            <button
                className="btn-volver"
                onClick={() => setPagina("GESTION DE GUARDIAS")}
            >
                ← Volver
            </button>

            <h3 className="titulo-formulario">
                Editar Guardia
            </h3>

            <form
                className="form-generico"
                onSubmit={guardarGuardia}
            >



                <div className="form-group">

                    <label>Fecha de la Guardia</label>

                    <input
                        type="date"
                        className="input-estilo"
                        value={guardiaEditar.fecha}
                        onChange={(e) =>
                            setGuardiaEditar({
                                ...guardiaEditar,
                                fecha: e.target.value
                            })
                        }
                        required
                    />

                </div>



                <div className="form-row">

                    <div className="form-group">

                        <label>Hora Inicio</label>

                        <input
                            type="time"
                            className="input-estilo"
                            value={guardiaEditar.horaInicio}
                            onChange={(e) =>
                                setGuardiaEditar({
                                    ...guardiaEditar,
                                    horaInicio: e.target.value
                                })
                            }
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label>Hora Fin</label>

                        <input
                            type="time"
                            className="input-estilo"
                            value={guardiaEditar.horaFin}
                            onChange={(e) =>
                                setGuardiaEditar({
                                    ...guardiaEditar,
                                    horaFin: e.target.value
                                })
                            }
                            required
                        />

                    </div>

                </div>



                <div className="form-group">

                    <label>Área</label>

                    <select

                        className="input-estilo"

                        value={guardiaEditar.rol}

                        onChange={async (e) => {

                            const rol = e.target.value;

                            await cargarEmpleadosPorRol(rol);

                            setGuardiaEditar({

                                ...guardiaEditar,
                                rol,
                                empleadoId: null

                            });

                        }}

                        required
                    >

                        <option value="">
                            Seleccione un área
                        </option>

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



                <div className="form-group">

                    <label>Personal Asignado</label>

                    <select

                        className="input-estilo"

                        value={guardiaEditar.empleadoId ?? ""}

                        onChange={(e) =>
                            setGuardiaEditar({

                                ...guardiaEditar,

                                empleadoId:
                                    e.target.value === ""
                                        ? null
                                        : Number(e.target.value)

                            })
                        }

                    >

                        <option value="">
                            Dejar sin asignar
                        </option>

                        {

                            empleados.map((emp) => (

                                <option
                                    key={emp.dni}
                                    value={emp.dni}
                                >

                                    {emp.nombre} {emp.apellido}

                                </option>

                            ))

                        }

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

export default EditarGuardia;