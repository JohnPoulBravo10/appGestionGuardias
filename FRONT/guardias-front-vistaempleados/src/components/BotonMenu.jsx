import React from 'react'

function BotonMenu({ texto, activo = false, onClick, esCerrarSesion = false }) {
  return (
    <button 
      className={`btn-menu ${activo ? 'activo' : ''} ${esCerrarSesion ? 'cerrar-sesion' : ''}`}
      onClick={onClick}
    >
      {texto}
    </button>
  );
}
export default BotonMenu

