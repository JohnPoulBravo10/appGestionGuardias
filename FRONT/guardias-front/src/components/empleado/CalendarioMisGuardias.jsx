import { useEffect, useState } from 'react'

import useUsuarioActual from '../../hooks/useUsuarioActual'

const API_BASE_URL = 'http://localhost:8090'

// Vista de calendario mensual para empleados: muestra las guardias del área correspondiente al empleado autenticado.
function CalendarioMisGuardias() {
  // Fecha de referencia para el mes visualizado
  const [fechaActual, setFechaActual] =
    useState(new Date())

  // Lista de guardias del área del empleado
  const [guardias, setGuardias] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  // Obtiene los datos del empleado autenticado para conocer su rol/área
  const {
    empleado,
    isLoading: cargandoEmpleado,
    error: errorEmpleado,
  } = useUsuarioActual()

  const mes = fechaActual.getMonth()
  const anio = fechaActual.getFullYear()

  const meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ]

  const diasSemana = [
    'Dom',
    'Lun',
    'Mar',
    'Mié',
    'Jue',
    'Vie',
    'Sáb',
  ]

  // Consulta al backend únicamente las guardias pertenecientes al área del empleado
  useEffect(() => {
    if (!empleado?.rol) {
      return
    }

    const obtenerGuardiasDelArea = async () => {
      try {
        setLoading(true)
        setError('')

        const token =
          localStorage.getItem('token')

        const response = await fetch(
          `${API_BASE_URL}/api/guardias/area/${empleado.rol}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              ...(token && {
                Authorization: `Bearer ${token}`,
              }),
            },
          }
        )

        if (!response.ok) {
          throw new Error(
            `No se pudieron obtener las guardias (${response.status})`
          )
        }

        const data = await response.json()

        setGuardias(data)
      } catch (err) {
        console.error(
          'Error al cargar guardias del área:',
          err
        )

        setError(
          'No se pudo cargar el calendario de guardias.'
        )
      } finally {
        setLoading(false)
      }
    }

    obtenerGuardiasDelArea()
  }, [empleado?.rol])

  // Cálculo de casilleros y desplazamiento para armar la cuadrícula mensual
  const diasDelMes = new Date(
    anio,
    mes + 1,
    0
  ).getDate()

  const primerDia = new Date(
    anio,
    mes,
    1
  ).getDay()

  const diasCalendario = []

  for (let i = 0; i < primerDia; i++) {
    diasCalendario.push(null)
  }

  for (
    let dia = 1;
    dia <= diasDelMes;
    dia++
  ) {
    diasCalendario.push(dia)
  }

  while (
    diasCalendario.length % 7 !== 0
  ) {
    diasCalendario.push(null)
  }

  // Navegación de mes anterior / siguiente
  const mesAnterior = () => {
    setFechaActual(
      new Date(anio, mes - 1, 1)
    )
  }

  const mesSiguiente = () => {
    setFechaActual(
      new Date(anio, mes + 1, 1)
    )
  }

  // Retorna la clase CSS correspondiente según el estado o área de la guardia
  const obtenerClaseGuardia = (
    guardia
  ) => {
    let clase = 'admin-guardia'

    if (
      guardia.estado === 'ABIERTA' ||
      guardia.empleadoId == null
    ) {
      return `${clase} admin-guardia-roja`
    }

    switch (guardia.rol) {
      case 'ENFERMERIA':
        clase +=
          ' admin-guardia-enfermeria'
        break

      case 'LIMPIEZA':
        clase +=
          ' admin-guardia-limpieza'
        break

      case 'MANTENIMIENTO':
        clase +=
          ' admin-guardia-mantenimiento'
        break

      case 'ADMINISTRADOR':
        clase +=
          ' admin-guardia-administrador'
        break

      default:
        clase +=
          ' admin-guardia-enfermeria'
    }

    return clase
  }

  // Filtra las guardias correspondientes a un día específico del mes y año en curso
  const obtenerGuardiasDelDia = (
    dia
  ) => {
    return guardias.filter(
      (guardia) => {
        if (!guardia.fecha) {
          return false
        }

        const [
          anioGuardia,
          mesGuardia,
          diaGuardia,
        ] = guardia.fecha
          .split('-')
          .map(Number)

        return (
          diaGuardia === dia &&
          mesGuardia === mes + 1 &&
          anioGuardia === anio
        )
      }
    )
  }

  if (
    cargandoEmpleado ||
    loading
  ) {
    return (
      <div className="admin-contenedor-calendario">
        <p>Cargando calendario...</p>
      </div>
    )
  }

  if (errorEmpleado || error) {
    return (
      <div className="admin-contenedor-calendario">
        <h2>
          Calendario de guardias
        </h2>

        <p>
          {error ||
            'No se pudo identificar al empleado autenticado.'}
        </p>
      </div>
    )
  }

  if (!empleado?.rol) {
    return (
      <div className="admin-contenedor-calendario">
        <p>
          El empleado no tiene un área asignada.
        </p>
      </div>
    )
  }

  return (
    <div className="admin-contenedor-calendario">
      <div className="admin-calendario-arriba">
        <div>
          <h2>
            Calendario de guardias
          </h2>

          <p className="empleado-area-calendario">
            Área:{' '}
            {String(
              empleado.rol
            ).replaceAll('_', ' ')}
          </p>
        </div>

        <div className="admin-calendario-filtros">
          <div className="admin-selector-mes">
            <button
              type="button"
              className="admin-btn-mes"
              onClick={mesAnterior}
            >
              ◀
            </button>

            <span className="admin-titulo-mes">
              {meses[mes]} de {anio}
            </span>

            <button
              type="button"
              className="admin-btn-mes"
              onClick={mesSiguiente}
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      <div className="calendario">
        <div className="admin-calendario-dias">
          {diasSemana.map((dia) => (
            <div key={dia}>
              <strong>{dia}</strong>
            </div>
          ))}
        </div>

        <div className="admin-calendario-cuadros">
          {diasCalendario.map(
            (dia, index) => (
              <div
                key={index}
                className="admin-dia-calendario"
              >
                {dia && (
                  <>
                    <div className="admin-numero-dia">
                      {dia}
                    </div>

                    {obtenerGuardiasDelDia(
                      dia
                    ).map((guardia) => (
                      <div
                        key={guardia.id}
                        className={obtenerClaseGuardia(
                          guardia
                        )}
                      >
                        <div className="admin-hora-guardia">
                          {guardia.horaInicio
                            ?.substring(0, 5)}
                          {' - '}
                          {guardia.horaFin
                            ?.substring(0, 5)}
                        </div>

                        <div className="admin-rol-guardia">
                          {guardia.rol}
                        </div>

                        <div className="admin-empleado-guardia">
                          {guardia.empleadoNombre ||
                            'Sin asignar'}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarioMisGuardias