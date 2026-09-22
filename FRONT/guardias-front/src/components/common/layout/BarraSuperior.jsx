import { useEffect, useState, useCallback } from 'react'

import BellIcon from '../icons/BellIcon'
import ModalNotificaciones from '../ui/ModalNotificaciones'

import {
  getEmpleadoIdFromToken,
  getToken,
  getRolFromToken,
} from '../../../utils/authUtils'

const API_BASE_URL = 'http://localhost:8090'

// Barra superior común: muestra el subtítulo institucional y el botón de notificaciones con indicador de mensajes no leídos.
function BarraSuperior() {
  const [modalVisible, setModalVisible] = useState(false)
  const [tieneNoLeidas, setTieneNoLeidas] = useState(false)

  // Consulta la existencia de notificaciones no leídas (personales y por rol si es administrador)
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

      // Si es administrador, comprobar también notificaciones globales dirigidas al rol
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

  // Escucha el evento global 'notificacion-leida' para actualizar el indicador visual (punto blanco)
  useEffect(() => {
    const handleNotificacionLeida = () => {
      verificarNoLeidas()
    }

    window.addEventListener('notificacion-leida', handleNotificacionLeida)

    return () => {
      window.removeEventListener('notificacion-leida', handleNotificacionLeida)
    }
  }, [verificarNoLeidas])

  // Callback para recalcular el indicador tras marcar como leída dentro del modal
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
