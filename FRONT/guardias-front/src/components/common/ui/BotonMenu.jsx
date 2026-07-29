import React from 'react'
import LogoutIcon from '../icons/LogoutIcon'

function BotonMenu({ texto, activo = false, onClick, esCerrarSesion = false }) {
  return (
    <button 
      className={`common-btn-menu ${activo ? 'activo' : ''} ${esCerrarSesion ? 'common-cerrar-sesion' : ''}`}
      onClick={onClick}
    >
      {esCerrarSesion && <LogoutIcon className="common-logout-icon" />}
      <span style={esCerrarSesion ? { fontWeight: 'bold' } : {}}>{texto}</span>
    </button>
  );
}
export default BotonMenu

