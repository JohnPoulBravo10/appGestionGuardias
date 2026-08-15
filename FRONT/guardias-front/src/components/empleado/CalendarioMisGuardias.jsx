import { useEffect, useState } from 'react'

import useUsuarioActual from '../../hooks/useUsuarioActual'

const API_BASE_URL = 'http://localhost:8090'

function CalendarioMisGuardias() {
  /*
   * Fecha del mes que estamos mirando.
   */
  const [fechaActual, setFechaActual] =
    useState(new Date())

  /*
   * Guardias pertenecientes al área
   * del empleado autenticado.
   */
  const [guardias, setGuardias] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  /*
   * Este hook obtiene al empleado autenticado.
   *
   * Necesitamos principalmente:
   * empleado.rol
   */
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

  /*
   * Cuando finalmente tenemos los datos del empleado,
   * usamos su rol para pedir solamente las guardias
   * de su área.
   */
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

              /*
               * Se envía el token si tus rutas
               * están protegidas.
               */
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

  /*
   * Construcción de los casilleros del calendario.
   */
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

  /*
   * Aunque el empleado solamente ve su área,
   * mantenemos las clases para reutilizar
   * los colores del calendario administrador.
   */
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

  /*
   * Filtra por día, mes y año.
   *
   * No necesitamos filtrar nuevamente por área,
   * porque el backend ya devolvió únicamente
   * el área del empleado.
   */
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