import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import useUsuarioActual from './useUsuarioActual'
import { getToken } from '../utils/authUtils'

const API_BASE_URL = 'http://localhost:8090'

/**
 * Hook para la gestión del formulario de solicitud de cambio de guardia (vista Empleado).
 * Permite listar guardias futuras disponibles (sin solicitud pendiente previa), listar compañeros del mismo rol y enviar la petición.
 *
 * @param {Object} [options] - Opciones de inicialización
 * @param {string} [options.initialGuardiaId] - ID de guardia a preseleccionar si viene desde otra vista
 */
export default function useSolicitarCambio(options = {}) {
  const { initialGuardiaId = '' } = options
  const {
    empleado,
    isLoading: cargandoEmpleado,
    error: errorEmpleado,
  } = useUsuarioActual()

  // Estado de inputs del formulario
  const [guardiaSeleccionada, setGuardiaSeleccionada] =
    useState('')
  const [companeroPropuesto, setCompaneroPropuesto] =
    useState('')
  const [motivo, setMotivo] = useState('')

  // Opciones para selectores
  const [guardias, setGuardias] = useState([])
  const [companeros, setCompaneros] = useState([])

  // Flags de carga y envío
  const [cargandoGuardias, setCargandoGuardias] =
    useState(false)
  const [cargandoCompaneros, setCargandoCompaneros] =
    useState(false)
  const [enviando, setEnviando] = useState(false)

  // Mensajes de error / éxito globales
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  // Errores de validación individuales por campo
  const [errorGuardia, setErrorGuardia] = useState('')
  const [errorMotivo, setErrorMotivo] = useState('')

  // Conjunto de IDs de guardias con solicitudes PENDIENTES activas (para excluirlas)
  const [guardiasConSolicitudPendiente, setGuardiasConSolicitudPendiente] =
    useState(new Set())

  // Evita re-aplicar la preselección inicial tras montarse
  const autoSeleccionAplicada = useRef(false)

  // Filtra guardias próximas (fecha >= hoy, estado PROXIMA) que no posean una solicitud pendiente y las ordena cronológicamente
  const filtrarGuardiasProximas = useCallback(
    (listaGuardias, idsConSolicitud) => {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      return listaGuardias
        .filter((guardia) => {
          if (!guardia.fecha) return false
          if (guardia.estado !== 'PROXIMA') return false

          if (idsConSolicitud.has(Number(guardia.id))) {
            return false
          }

          const fechaGuardia = new Date(
            guardia.fecha + 'T00:00:00'
          )

          return fechaGuardia >= hoy
        })
        .sort((a, b) => {
          const fechaA = new Date(
            a.fecha + 'T' + (a.horaInicio || '00:00')
          )

          const fechaB = new Date(
            b.fecha + 'T' + (b.horaInicio || '00:00')
          )

          return fechaA - fechaB
        })
    },
    []
  )

  // Obtiene el conjunto de IDs de guardias que ya tienen solicitud PENDIENTE para el empleado
  const cargarSolicitudesPendientes = useCallback(
    async (empleadoDni) => {
      try {
        const token = getToken()

        if (!token) return new Set()

        const response = await fetch(
          `${API_BASE_URL}/api/solicitudes/empleado/${empleadoDni}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) return new Set()

        const data = await response.json()

        if (!Array.isArray(data)) return new Set()

        const ids = new Set(
          data
            .filter(
              (s) =>
                s.estado === 'PENDIENTE' &&
                s.infoGuardia?.guardiaId != null
            )
            .map((s) => Number(s.infoGuardia.guardiaId))
        )

        setGuardiasConSolicitudPendiente(ids)

        return ids
      } catch (err) {
        console.error(
          'Error al cargar solicitudes pendientes:',
          err
        )

        return new Set()
      }
    },
    []
  )

  // Consulta en paralelo las guardias asignadas y las solicitudes pendientes del empleado
  const cargarGuardias = useCallback(
    async (empleadoId) => {
      setCargandoGuardias(true)

      try {
        const token = getToken()

        if (!token) {
          throw new Error('No hay una sesión iniciada.')
        }

        const [responseGuardias, idsConSolicitud] =
          await Promise.all([
            fetch(
              `${API_BASE_URL}/api/guardias/empleado/${empleadoId}`,
              {
                method: 'GET',
                headers: {
                  Accept: 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }
            ),
            cargarSolicitudesPendientes(empleadoId),
          ])

        if (!responseGuardias.ok) {
          throw new Error(
            `Error al obtener guardias (${responseGuardias.status})`
          )
        }

        const data = await responseGuardias.json()
        const lista = Array.isArray(data) ? data : []

        setGuardias(
          filtrarGuardiasProximas(lista, idsConSolicitud)
        )
      } catch (err) {
        console.error(
          'Error al cargar guardias:',
          err
        )

        setError(
          err.message ||
          'Error al cargar las guardias asignadas.'
        )
      } finally {
        setCargandoGuardias(false)
      }
    },
    [filtrarGuardiasProximas, cargarSolicitudesPendientes]
  )

  // Consulta compañeros con el mismo rol excluyendo al propio empleado
  const cargarCompaneros = useCallback(
    async (rol, dniPropio) => {
      setCargandoCompaneros(true)

      try {
        const token = getToken()

        if (!token) {
          throw new Error('No hay una sesión iniciada.')
        }

        const response = await fetch(
          `${API_BASE_URL}/api/empleados/area/${rol}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error(
            `Error al obtener compañeros (${response.status})`
          )
        }

        const data = await response.json()
        const lista = Array.isArray(data) ? data : []

        const sinElPropio = lista.filter(
          (emp) => String(emp.dni) !== String(dniPropio)
        )

        setCompaneros(sinElPropio)
      } catch (err) {
        console.error(
          'Error al cargar compañeros:',
          err
        )

        setError(
          err.message ||
          'Error al cargar la lista de compañeros.'
        )
      } finally {
        setCargandoCompaneros(false)
      }
    },
    []
  )

  // Dispara la carga de guardias y compañeros una vez obtenidos los datos del empleado
  useEffect(() => {
    if (!empleado) return

    cargarGuardias(empleado.dni)
    cargarCompaneros(empleado.rol, empleado.dni)
  }, [empleado, cargarGuardias, cargarCompaneros])

  // Preselecciona la guardia inicial si se especificó vía options
  useEffect(() => {
    if (autoSeleccionAplicada.current) return
    if (!initialGuardiaId) return
    if (cargandoGuardias) return
    if (guardias.length === 0) return

    const existe = guardias.some(
      (g) => String(g.id) === String(initialGuardiaId)
    )

    if (existe) {
      setGuardiaSeleccionada(String(initialGuardiaId))
    }

    autoSeleccionAplicada.current = true
  }, [
    initialGuardiaId,
    guardias,
    cargandoGuardias,
  ])

  // Restablece los campos del formulario
  const resetearFormulario = useCallback(() => {
    setGuardiaSeleccionada('')
    setCompaneroPropuesto('')
    setMotivo('')
  }, [])

  // Formatea hora a formato legible "HH:MM"
  const formatearHora = useCallback((hora) => {
    if (!hora) return '--:--'
    return hora.substring(0, 5)
  }, [])

  // Genera el texto descriptivo para el selector de guardias
  const formatearOpcionGuardia = useCallback(
    (guardia) => {
      const fecha = guardia.fecha || 'Sin fecha'

      const horaInicio = formatearHora(
        guardia.horaInicio
      )

      const horaFin = formatearHora(guardia.horaFin)
      const rol = guardia.rol || ''

      return `${fecha} (${horaInicio} - ${horaFin}) — ${rol}`
    },
    [formatearHora]
  )

  // Valida y envía la solicitud de cambio de guardia al microservicio de solicitudes
  const enviarSolicitud = useCallback(
    async (event) => {
      event.preventDefault()

      setError('')
      setExito('')
      setErrorGuardia('')
      setErrorMotivo('')

      let tieneErrores = false

      if (!guardiaSeleccionada) {
        setErrorGuardia('Debés seleccionar una guardia.')
        tieneErrores = true
      }

      if (!motivo.trim()) {
        setErrorMotivo('El motivo del cambio es obligatorio.')
        tieneErrores = true
      }

      if (tieneErrores) return

      if (!empleado) {
        setError(
          'No se pudieron obtener los datos del empleado.'
        )
        return
      }

      const guardia = guardias.find(
        (g) => String(g.id) === String(guardiaSeleccionada)
      )

      if (!guardia) {
        setError(
          'La guardia seleccionada ya no está disponible.'
        )
        return
      }

      setEnviando(true)

      try {
        const token = getToken()

        if (!token) {
          throw new Error('No hay una sesión iniciada.')
        }

        const body = {
          nombreEmpleado:
            `${empleado.nombre} ${empleado.apellido}`,
          empleadoDni: String(empleado.dni),
          infoGuardia: {
            guardiaId: guardia.id,
            fecha: guardia.fecha,
            horaInicio: guardia.horaInicio,
            horaFin: guardia.horaFin,
            rol: guardia.rol,
          },
          motivo: motivo.trim(),
        }

        if (companeroPropuesto) {
          const companero = companeros.find(
            (c) =>
              String(c.dni) ===
              String(companeroPropuesto)
          )

          if (companero) {
            body.nombreEmpleadoReemplazo =
              `${companero.nombre} ${companero.apellido}`

            body.empleadoReemplazoDni = String(
              companero.dni
            )
          }
        }

        const response = await fetch(
          `${API_BASE_URL}/api/solicitudes`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          }
        )

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => null)

          const mensaje =
            errorData?.message ||
            `Error al enviar la solicitud (${response.status})`

          throw new Error(mensaje)
        }

        setExito(
          '¡Solicitud enviada correctamente! Será revisada por un administrador.'
        )

        resetearFormulario()

        // Recarga la lista para que la guardia solicitada ya no esté disponible
        if (empleado?.dni) {
          cargarGuardias(empleado.dni)
        }
      } catch (err) {
        console.error(
          'Error al enviar solicitud:',
          err
        )

        setError(
          err.message ||
          'Ocurrió un error al enviar la solicitud.'
        )
      } finally {
        setEnviando(false)
      }
    },
    [
      guardiaSeleccionada,
      companeroPropuesto,
      motivo,
      empleado,
      guardias,
      companeros,
      resetearFormulario,
      cargarGuardias,
    ]
  )

  const isLoading =
    cargandoEmpleado ||
    cargandoGuardias ||
    cargandoCompaneros

  return {
    empleado,
    errorEmpleado,

    guardias,
    companeros,

    guardiaSeleccionada,
    setGuardiaSeleccionada,

    companeroPropuesto,
    setCompaneroPropuesto,

    motivo,
    setMotivo,

    enviarSolicitud,

    formatearOpcionGuardia,

    isLoading,
    enviando,
    error,
    exito,
    setExito,
    errorGuardia,
    errorMotivo,
  }
}
