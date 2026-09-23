import { useCallback, useEffect, useState } from 'react'

import { getToken } from '../utils/authUtils'

const API_BASE_URL = 'http://localhost:8090'

/**
 * Hook para la gestión y resolución de solicitudes de cambio de guardia (vista Administrador).
 * Permite listar solicitudes pendientes, cargar empleados para reasignación y aprobar/rechazar peticiones.
 */
export default function useGestionSolicitudes() {
  // Solicitudes pendientes y nómina de empleados
  const [solicitudes, setSolicitudes] = useState([])
  const [empleados, setEmpleados] = useState([])

  // Estado de carga y error
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Estado del modal de resolución (aprobar / rechazar)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [solicitudActiva, setSolicitudActiva] =
    useState(null)
  const [accionModal, setAccionModal] = useState('')
  const [procesando, setProcesando] = useState(false)

  // Configura las cabeceras HTTP con el token de autorización
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

  // Consulta solicitudes con estado PENDIENTE
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
        '[USE_GESTION_SOLICITUDES] Error al cargar solicitudes:',
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

  // Consulta la lista de empleados para la reasignación en el modal
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
        '[USE_GESTION_SOLICITUDES] Error al cargar empleados:',
        err
      )
    }
  }, [buildHeaders])

  // Carga inicial al montar el hook
  useEffect(() => {
    cargarSolicitudes()
    cargarEmpleados()
  }, [cargarSolicitudes, cargarEmpleados])

  // Abre el modal de resolución configurando la solicitud y la acción ('aprobar' | 'rechazar')
  const abrirModal = useCallback(
    (solicitud, accion) => {
      setSolicitudActiva(solicitud)
      setAccionModal(accion)
      setModalAbierto(true)
    },
    []
  )

  // Cierra el modal y restablece la selección
  const cerrarModal = useCallback(() => {
    setModalAbierto(false)
    setSolicitudActiva(null)
    setAccionModal('')
  }, [])

  // Envía la aprobación o rechazo de la solicitud al backend
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

        // Si se asignó un empleado de reemplazo, incluir DNI y nombre completo
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

        // Remueve la solicitud resuelta de la lista local optimísticamente
        setSolicitudes((previas) =>
          previas.filter(
            (s) => s.id !== solicitudActiva.id
          )
        )

        console.info(
          `[USE_GESTION_SOLICITUDES] Solicitud ID ${solicitudActiva.id} resuelta con éxito (${accionModal})`
        )

        cerrarModal()

        return true
      } catch (err) {
        console.error(
          `[USE_GESTION_SOLICITUDES] Error al ${accionModal} solicitud:`,
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
      empleados,
      buildHeaders,
      cerrarModal,
    ]
  )

  // Formatea hora a formato legible "HH:MM"
  const formatearHora = useCallback((hora) => {
    if (!hora) return '--:--'
    return hora.substring(0, 5)
  }, [])

  return {
    solicitudes,
    empleados,

    cargando,
    error,
    setError,

    modalAbierto,
    solicitudActiva,
    accionModal,
    procesando,
    abrirModal,
    cerrarModal,
    resolverSolicitud,

    formatearHora,
    recargar: cargarSolicitudes,
  }
}
