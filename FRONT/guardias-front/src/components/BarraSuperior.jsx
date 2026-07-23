import React from 'react'
import BellIcon from './BellIcon'

function BarraSuperior() {
  return (
    <div className='barrasuperior'>
      <button className="btn-notificacion" aria-label="Notificaciones">
        <BellIcon style={{ width: '20px', height: '20px' }} />
      </button>
    </div>
  )
}

export default BarraSuperior