import React, { useEffect, useState } from "react";

function CalendarioGuardias() {
    // ===========================
    // Fecha mostrada en el calendario
    // ===========================
    const [fechaActual, setFechaActual] = useState(new Date());

    const mes = fechaActual.getMonth();
    const anio = fechaActual.getFullYear();

    // ===========================
    // Estados y Filtros
    // ===========================
    const [guardias, setGuardias] = useState([]);
    const [filtroArea, setFiltroArea] = useState("Todas las Áreas");

    // ===========================
    // Obtener guardias
    // ===========================
    useEffect(() => {
        obtenerGuardias();
    }, []);

    const obtenerGuardias = async () => {
        try {
            const response = await fetch("http://localhost:8090/api/guardias");

            if (!response.ok) {
                throw new Error("Error al obtener guardias");
            }

            const data = await response.json();
            setGuardias(data);
        } catch (error) {
            console.error(error);
        }
    };

    // ===========================
    // Meses y Días
    // ===========================
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const diasDelMes = new Date(anio, mes + 1, 0).getDate();
    const primerDia = new Date(anio, mes, 1).getDay();

    const diasCalendario = [];

    for (let i = 0; i < primerDia; i++) {
        diasCalendario.push(null);
    }

    for (let i = 1; i <= diasDelMes; i++) {
        diasCalendario.push(i);
    }

    while (diasCalendario.length % 7 !== 0) {
        diasCalendario.push(null);
    }

    // ===========================
    // Navegación
    // ===========================
    const mesAnterior = () => {
        setFechaActual(new Date(anio, mes - 1, 1));
    };

    const mesSiguiente = () => {
        setFechaActual(new Date(anio, mes + 1, 1));
    };

    // ===========================
    // Obtener clase CSS según la guardia
    // ===========================
    const obtenerClaseGuardia = (g) => {
        let clase = "admin-guardia";

        if (g.estado === "ABIERTA") {
            clase += " admin-guardia-roja";
        } else {
            switch (g.rol) {
                case "ENFERMERIA":
                    clase += " admin-guardia-enfermeria";
                    break;
                case "LIMPIEZA":
                    clase += " admin-guardia-limpieza";
                    break;
                case "MANTENIMIENTO":
                    clase += " admin-guardia-mantenimiento";
                    break;
                case "ADMINISTRADOR":
                    clase += " admin-guardia-administrador";
                    break;
                default:
                    clase += " admin-guardia-enfermeria";
                    break;
            }
        }
        return clase;
    };

    return (
        <div className="admin-contenedor-calendario">
            <div className="admin-calendario-arriba">
                <h2>Calendario de Guardias</h2>

                <div className="admin-calendario-filtros">
                    <div className="admin-selector-mes">
                        <button className="admin-btn-mes" onClick={mesAnterior}>
                            ◀
                        </button>
                        <span className="admin-titulo-mes">
                            {meses[mes]} de {anio}
                        </span>
                        <button className="admin-btn-mes" onClick={mesSiguiente}>
                            ▶
                        </button>
                    </div>

                    <select
                        className="admin-input-estilo"
                        value={filtroArea}
                        onChange={(e) => setFiltroArea(e.target.value)}
                    >
                        <option value="Todas las Áreas">Todas las Áreas</option>
                        <option value="ENFERMERIA">ENFERMERIA</option>
                        <option value="LIMPIEZA">LIMPIEZA</option>
                        <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                    </select>
                </div>
            </div>

            <div className="calendario">
                <div className="admin-calendario-dias">
                    {diasSemana.map(dia => (
                        <div key={dia}>
                            <strong>{dia}</strong>
                        </div>
                    ))}
                </div>

                <div className="admin-calendario-cuadros">
                    {diasCalendario.map((dia, index) => (
                        <div key={index} className="admin-dia-calendario">
                            {dia && (
                                <>
                                    <div className="admin-numero-dia">
                                        {dia}
                                    </div>

                                    {guardias
                                        .filter(g => {
                                            const [anioGuardia, mesGuardia, diaGuardia] =
                                                g.fecha.split("-").map(Number);

                                            const coincideFecha = (
                                                diaGuardia === dia &&
                                                mesGuardia === mes + 1 &&
                                                anioGuardia === anio
                                            );

                                            const coincideArea = (
                                                filtroArea === "Todas las Áreas" || g.rol === filtroArea
                                            );

                                            return coincideFecha && coincideArea;
                                        })
                                        .map((g, idx) => (
                                            <div key={idx} className={obtenerClaseGuardia(g)}>
                                                <div className="admin-hora-guardia">
                                                    {g.horaInicio ? g.horaInicio.substring(0, 5) : ""} - {g.horaFin ? g.horaFin.substring(0, 5) : ""}
                                                </div>
                                                <div className="admin-rol-guardia">
                                                    {g.rol}
                                                </div>
                                                <div className="admin-empleado-guardia">
                                                    {g.empleadoNombre ?? "Sin asignar"}
                                                </div>
                                            </div>
                                        ))
                                    }
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );


}

export default CalendarioGuardias;