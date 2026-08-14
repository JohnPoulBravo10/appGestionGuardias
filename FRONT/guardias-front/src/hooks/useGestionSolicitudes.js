import { useCallback, useEffect, useState } from 'react'

import { getToken } from '../utils/authUtils'

/**
 * URL base del API Gateway.
 */
const API_BASE_URL = 'http://localhost:8090'

/**
 * Hook que encapsula la lógica de la pantalla "Solicitudes de Cambio"
 * en la vista de administrador.
 *
 * Responsabilidades:
 * 1. Cargar solicitudes con estado PENDIENTE.
 * 2. Cargar la lista completa de empleados (para el modal).
 * 3. Aprobar una solicitud (requiere empleado propuesto).
 * 4. Rechazar una solicitud (empleado propuesto opcional).
 * 5. Gestionar el estado del modal de resolución.
 */
export default function useGestionSolicitudes() {
  /* ── Datos ── */
  const [solicitudes, setSolicitudes] = useState([])
  const [empleados, setEmpleados] = useState([])

  /* ── Estado de carga ── */
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  /* ── Modal de resolución ── */
  const [modalAbierto, setModalAbierto] = useState(false)
  const [solicitudActiva, setSolicitudActiva] =
    useState(null)

  /** 'aprobar' | 'rechazar' */
  const [accionModal, setAccionModal] = useState('')
  const [procesando, setProcesando] = useState(false)

  /**
   * Construye los headers con el token JWT.
   * Lanza un error si no hay sesión activa.
   */
  const buildHeaders = useCallback((conBody = false) => {
    const token = getToken()

    if (!token) {
      throw new Error('No hay una sesión iniciada.')
    }

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    }

    if (conBody) {
      headers['Content-Type'] = 'application/json'
    }

    return headers
  }, [])

  /**
   * Carga todas las solicitudes con estado PENDIENTE.
   */
  const cargarSolicitudes = useCallback(async () => {
    setCargando(true)
    setError('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/solicitudes/estado/PENDIENTE`,
        {
          method: 'GET',
          headers: buildHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Error al obtener solicitudes (${response.status})`
        )
      }

      const data = await response.json()

      setSolicitudes(
        Array.isArray(data) ? data : []
      )
    } catch (err) {
      console.error(
        'Error al cargar solicitudes:',
        err
      )

      setError(
        err.message ||
          'Error al cargar las solicitudes.'
      )
    } finally {
      setCargando(false)
    }
  }, [buildHeaders])

  /**
   * Carga todos los empleados para el dropdown del modal.
   */
  const cargarEmpleados = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/empleados`,
        {
          method: 'GET',
          headers: buildHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Error al obtener empleados (${response.status})`
        )
      }

      const data = await response.json()

      setEmpleados(
        Array.isArray(data) ? data : []
      )
    } catch (err) {
      console.error(
        'Error al cargar empleados:',
        err
      )
    }
  }, [buildHeaders])

  /**
   * Carga inicial de datos.
   */
  useEffect(() => {
    cargarSolicitudes()
    cargarEmpleados()
  }, [cargarSolicitudes, cargarEmpleados])

  /**
   * Abre el modal de resolución para una solicitud.
   *
   * @param {Object} solicitud — la solicitud seleccionada
   * @param {'aprobar'|'rechazar'} accion — tipo de resolución
   */
  const abrirModal = useCallback(
    (solicitud, accion) => {
      setSolicitudActiva(solicitud)
      setAccionModal(accion)
      setModalAbierto(true)
    },
    []
  )

  /**
   * Cierra el modal y resetea su estado.
   */
  const cerrarModal = useCallback(() => {
    setModalAbierto(false)
    setSolicitudActiva(null)
    setAccionModal('')
  }, [])

  /**
   * Ejecuta la resolución de la solicitud (aprobar o rechazar).
   *
   * Al aprobar, el empleado propuesto es obligatorio.
   * Al rechazar, es opcional.
   *
   * @param {Object} datos — { empleadoPropuestoDni, observacion }
   * @returns {Promise<boolean>} true si la operación fue exitosa
   */
  const resolverSolicitud = useCallback(
    async (datos) => {
      if (!solicitudActiva || !accionModal) return false

      setProcesando(true)
      setError('')

      try {
        const endpoint =
          accionModal === 'aprobar'
            ? `${API_BASE_URL}/api/solicitudes/${solicitudActiva.id}/aprobar`
            : `${API_BASE_URL}/api/solicitudes/${solicitudActiva.id}/rechazar`

        const body = {}

        if (datos.observacion?.trim()) {
          body.observacion = datos.observacion.trim()
        }

        /*
         * Si el admin seleccionó un empleado de reemplazo,
         * incluir su DNI (como número) y su nombre completo.
         */
        if (datos.empleadoPropuestoDni) {
          body.empleadoReemplazoDni = Number(
            datos.empleadoPropuestoDni
          )

          const emp = empleados.find(
            (e) =>
              String(e.dni) ===
              String(datos.empleadoPropuestoDni)
          )

          if (emp) {
            body.nombreEmpleadoReemplazo = `${emp.nombre} ${emp.apellido}`
          }
        }

        const response = await fetch(endpoint, {
          method: 'PATCH',
          headers: buildHeaders(true),
          body: JSON.stringify(body),
        })

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => null)

          const mensaje =
            errorData?.message ||
            `Error al ${accionModal} la solicitud (${response.status})`

          throw new Error(mensaje)
        }

        /*
         * Removemos la solicitud resuelta de la lista local
         * para evitar refetch innecesario.
         */
        setSolicitudes((previas) =>
          previas.filter(
            (s) => s.id !== solicitudActiva.id
          )
        )

        cerrarModal()

        return true
      } catch (err) {
        console.error(
          `Error al ${accionModal} solicitud:`,
          err
        )

        setError(
          err.message ||
            `Error al ${accionModal} la solicitud.`
        )

        return false
      } finally {
        setProcesando(false)
      }
    },
    [
      solicitudActiva,
      accionModal,
      buildHeaders,
      cerrarModal,
    ]
  )

  /**
   * Formatea "HH:MM:SS" o "HH:MM" a "HH:MM".
   */
  const formatearHora = useCallback((hora) => {
    if (!hora) return '--:--'
    return hora.substring(0, 5)
  }, [])

  return {
    /* Datos */
    solicitudes,
    empleados,

    /* Estado de carga */
    cargando,
    error,
    setError,

    /* Modal */
    modalAbierto,
    solicitudActiva,
    accionModal,
    procesando,
    abrirModal,
    cerrarModal,
    resolverSolicitud,

    /* Utilidades */
    formatearHora,
    recargar: cargarSolicitudes,
  }
}
