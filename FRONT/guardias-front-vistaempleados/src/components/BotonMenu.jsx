import React from 'react'
import LogoutIcon from './LogoutIcon'

function BotonMenu({ texto, activo = false, onClick, esCerrarSesion = false }) {
  return (
    <button
      className={`btn-menu ${activo ? 'activo' : ''} ${esCerrarSesion ? 'cerrar-sesion' : ''}`}
      onClick={onClick}
    >
      {esCerrarSesion && <LogoutIcon className="logout-icon" />}
      <span style={esCerrarSesion ? { fontWeight: 'bold' } : {}}>{texto}</span>
    </button>
  );
}
export default BotonMenu
