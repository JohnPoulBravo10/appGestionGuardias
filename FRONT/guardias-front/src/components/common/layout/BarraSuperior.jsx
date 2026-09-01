import { useEffect, useState, useCallback } from 'react'

import BellIcon from '../icons/BellIcon'
import ModalNotificaciones from '../ui/ModalNotificaciones'

import {
  getEmpleadoIdFromToken,
  getToken,
  getRolFromToken,
} from '../../../utils/authUtils'

const API_BASE_URL = 'http://localhost:8090'

/**
 * Barra superior compartida por AdminLayout y EmpleadoLayout.
 *
 * Incluye el botón de campanita que:
 * - Muestra un punto blanco cuando existen notificaciones no leídas.
 * - Abre un modal con la lista completa de notificaciones al hacer click.
 */
function BarraSuperior() {

  const [modalVisible, setModalVisible] = useState(false)
  const [tieneNoLeidas, setTieneNoLeidas] = useState(false)

  /**
   * Consulta la API para verificar si el usuario tiene
   * notificaciones sin leer. Si es ADMINISTRADOR, también
   * comprueba las notificaciones dirigidas al rol.
   */
  const verificarNoLeidas = useCallback(async () => {

    try {

      const empleadoId = getEmpleadoIdFromToken()
      const token = getToken()

      if (!empleadoId || !token) {
        return
      }

      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      }

      // Notificaciones personales
      const response = await fetch(
        `${API_BASE_URL}/api/notificaciones/empleado/${empleadoId}`,
        { method: 'GET', headers }
      )

      if (!response.ok) {
        return
      }

      const data = await response.json()
      const lista = Array.isArray(data) ? data : []

      let hayNoLeidas = lista.some((n) => !n.leida)

      // Si es administrador y aún no hay no leídas personales,
      // verificar también las notificaciones dirigidas al rol
      if (!hayNoLeidas) {

        const rol = getRolFromToken()

        if (rol === 'ADMINISTRADOR') {

          try {

            const responseRol = await fetch(
              `${API_BASE_URL}/api/notificaciones/rol/${rol}`,
              { method: 'GET', headers }
            )

            if (responseRol.ok) {
              const dataRol = await responseRol.json()
              const listaRol = Array.isArray(dataRol) ? dataRol : []
              hayNoLeidas = listaRol.some((n) => !n.leida)
            }

          } catch (errRol) {
            console.error('Error al verificar notificaciones por rol:', errRol)
          }
        }
      }

      setTieneNoLeidas(hayNoLeidas)

    } catch (err) {
      console.error('Error al verificar notificaciones no leídas:', err)
    }
  }, [])

  useEffect(() => {
    verificarNoLeidas()
  }, [verificarNoLeidas])

  // Escuchar cuando otro componente (ej: PanelEmpleado) marca
  // una notificación como leída, para actualizar el punto blanco
  useEffect(() => {

    const handleNotificacionLeida = () => {
      verificarNoLeidas()
    }

    window.addEventListener('notificacion-leida', handleNotificacionLeida)

    return () => {
      window.removeEventListener('notificacion-leida', handleNotificacionLeida)
    }
  }, [verificarNoLeidas])

  /**
   * Se invoca desde el modal cuando el usuario marca una
   * notificación como leída, para recalcular el indicador.
   */
  const handleNotificacionLeida = () => {
    verificarNoLeidas()
  }

  return (
    <div className="common-barra-superior">
      <div>
        <p className="login-subtitle">
          Sistema de Gestión de Guardias de Salud
        </p>
      </div>

      <button
        className="common-btn-notificacion"
        aria-label="Notificaciones"
        onClick={() => setModalVisible(true)}
      >
        <BellIcon style={{ width: '20px', height: '20px' }} />

        {tieneNoLeidas && (
          <span className="common-btn-notificacion-punto" />
        )}
      </button>

      <ModalNotificaciones
        visible={modalVisible}
        onCerrar={() => setModalVisible(false)}
        onNotificacionLeida={handleNotificacionLeida}
      />
    </div>
  )
}

export default BarraSuperior
