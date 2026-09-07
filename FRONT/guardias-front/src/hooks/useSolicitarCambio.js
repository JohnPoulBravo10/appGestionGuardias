import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import useUsuarioActual from './useUsuarioActual'
import { getToken } from '../utils/authUtils'

/**
 * URL base del API Gateway.
 * Centralizada para evitar repetición en múltiples fetch.
 */
const API_BASE_URL = 'http://localhost:8090'

/**
 * Hook que encapsula la lógica del formulario "Solicitar Cambio de Guardia".
 *
 * Responsabilidades:
 * 1. Obtener los datos del empleado autenticado (nombre, DNI, rol).
 * 2. Cargar las guardias PRÓXIMAS asignadas al empleado (fecha ≥ hoy),
 *    excluyendo aquellas que ya tienen una solicitud PENDIENTE.
 * 3. Cargar los compañeros que comparten el mismo rol (excluyendo al propio).
 * 4. Gestionar el estado del formulario (guardia, compañero, motivo).
 * 5. Enviar la solicitud al solicitudes-service vía POST.
 *
 * @param {Object} [options] — opciones de configuración
 * @param {string} [options.initialGuardiaId] — ID de guardia a pre-seleccionar
 */
export default function useSolicitarCambio(options = {}) {
  const { initialGuardiaId = '' } = options
  const {
    empleado,
    isLoading: cargandoEmpleado,
    error: errorEmpleado,
  } = useUsuarioActual()

  /* ── Estado del formulario ── */
  const [guardiaSeleccionada, setGuardiaSeleccionada] =
    useState('')

  const [companeroPropuesto, setCompaneroPropuesto] =
    useState('')

  const [motivo, setMotivo] = useState('')

  /* ── Datos para los dropdowns ── */
  const [guardias, setGuardias] = useState([])
  const [companeros, setCompaneros] = useState([])

  /* ── Estados de carga / envío ── */
  const [cargandoGuardias, setCargandoGuardias] =
    useState(false)

  const [cargandoCompaneros, setCargandoCompaneros] =
    useState(false)

  const [enviando, setEnviando] = useState(false)

  /* ── Feedback al usuario ── */
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  /* ── Errores de validación por campo ── */
  const [errorGuardia, setErrorGuardia] = useState('')
  const [errorMotivo, setErrorMotivo] = useState('')

  /**
   * IDs de guardias que ya tienen una solicitud PENDIENTE.
   * Se usa para excluirlas del dropdown.
   */
  const [guardiasConSolicitudPendiente, setGuardiasConSolicitudPendiente] =
    useState(new Set())

  /**
   * Ref para evitar seleccionar automáticamente la guardia más de una vez.
   */
  const autoSeleccionAplicada = useRef(false)

  /**
   * Filtra las guardias dejando únicamente las que:
   * - Tienen fecha igual o posterior a hoy.
   * - Están en estado PROXIMA.
   *
   * Ordena el resultado por fecha + hora de inicio ascendente.
   */
  const filtrarGuardiasProximas = useCallback(
    (listaGuardias, idsConSolicitud) => {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      return listaGuardias
        .filter((guardia) => {
          if (!guardia.fecha) return false
          if (guardia.estado !== 'PROXIMA') return false

          /* Excluir guardias que ya tienen una solicitud pendiente */
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

  /**
   * Obtiene las solicitudes pendientes del empleado y devuelve
   * un Set con los guardiaId que ya tienen solicitud.
   */
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

  /**
   * Carga las guardias asignadas al empleado logueado,
   * las filtra para mostrar solo las próximas y excluye
   * aquellas que ya tienen una solicitud PENDIENTE.
   */
  const cargarGuardias = useCallback(
    async (empleadoId) => {
      setCargandoGuardias(true)

      try {
        const token = getToken()

        if (!token) {
          throw new Error('No hay una sesión iniciada.')
        }

        /*
         * Cargamos solicitudes pendientes en paralelo con las guardias
         * para poder filtrarlas antes de setear el estado.
         */
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

  /**
   * Carga los empleados que comparten el mismo rol,
   * excluyendo al empleado que realiza la solicitud.
   */
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

        /*
         * Excluimos al propio empleado de la lista
         * para que no se proponga a sí mismo.
         */
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

  /**
   * Cuando los datos del empleado estén disponibles,
   * disparamos la carga de guardias y compañeros.
   */
  useEffect(() => {
    if (!empleado) return

    cargarGuardias(empleado.dni)
    cargarCompaneros(empleado.rol, empleado.dni)
  }, [empleado, cargarGuardias, cargarCompaneros])

  /**
   * Cuando las guardias terminan de cargar y hay un initialGuardiaId,
   * lo selecciona automáticamente si existe en la lista filtrada.
   * Se aplica una sola vez para no interferir con la interacción del usuario.
   */
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

  /**
   * Resetea el formulario a su estado inicial.
   */
  const resetearFormulario = useCallback(() => {
    setGuardiaSeleccionada('')
    setCompaneroPropuesto('')
    setMotivo('')
  }, [])

  /**
   * Formatea "HH:MM:SS" o "HH:MM" a "HH:MM" para mostrar en el dropdown.
   */
  const formatearHora = useCallback((hora) => {
    if (!hora) return '--:--'
    return hora.substring(0, 5)
  }, [])

  /**
   * Construye la etiqueta visible del dropdown de guardias.
   * Ejemplo: "28/05/2026 (08:00 - 16:00) — ENFERMERIA"
   */
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

  /**
   * Envía la solicitud de cambio de guardia al backend.
   *
   * Validaciones previas:
   * - Guardia seleccionada obligatoria.
   * - Motivo obligatorio.
   * - Compañero propuesto es opcional.
   */
  const enviarSolicitud = useCallback(
    async (event) => {
      event.preventDefault()

      setError('')
      setExito('')
      setErrorGuardia('')
      setErrorMotivo('')

      /* ── Validaciones por campo ── */
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

      /* Buscamos la guardia seleccionada para armar el DTO */
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

        /*
         * Armamos el body según SolicitudRequestDto del backend.
         * Los campos nombreEmpleadoReemplazo y empleadoReemplazoDni
         * solo se incluyen si se eligió un compañero.
         */
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

        /* Si se seleccionó un compañero, agregamos sus datos */
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

        /*
         * Recargamos la lista de guardias para que la guardia
         * recién solicitada desaparezca del dropdown.
         */
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

  /* ── Estado de carga general ── */
  const isLoading =
    cargandoEmpleado ||
    cargandoGuardias ||
    cargandoCompaneros

  return {
    /* Datos del empleado logueado */
    empleado,
    errorEmpleado,

    /* Dropdowns */
    guardias,
    companeros,

    /* Estado del formulario */
    guardiaSeleccionada,
    setGuardiaSeleccionada,

    companeroPropuesto,
    setCompaneroPropuesto,

    motivo,
    setMotivo,

    /* Acciones */
    enviarSolicitud,

    /* Utilidades de formato */
    formatearOpcionGuardia,

    /* Estado de UI */
    isLoading,
    enviando,
    error,
    exito,
    setExito,
    errorGuardia,
    errorMotivo,
  }
}
