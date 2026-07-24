import React from 'react'
import BellIcon from './BellIcon'

function BarraSuperior() {
  return (
    <div className='barrasuperior'>
      <div>
        <p className="login-subtitle">
          Sistema de Gestión de Guardias de Salud
        </p>
      </div>
     

      <button className="btn-notificacion" aria-label="Notificaciones">
        <BellIcon style={{ width: '20px', height: '20px' }} />
      </button>
    </div>
  )
}

export default BarraSuperior