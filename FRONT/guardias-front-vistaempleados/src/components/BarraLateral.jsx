import React from 'react'
import BotonMenu from './BotonMenu'

function BarraLateral({ paginaActual, setPagina }) {
  return (
    <aside className="barralateral">
      <div className="perfil">
        <div className="foto-perfil">👤</div>
        <h3>JUAN PABLO<br/>BRAVO</h3>
        <p>ENFERMERIA</p>
      </div>

      <nav className="menu">
        <BotonMenu texto="INICIO" activo={paginaActual === 'INICIO'} onClick={() => setPagina('INICIO')} />
        <BotonMenu texto="CALENDARIO" activo={paginaActual === 'CALENDARIO'} onClick={() => setPagina('CALENDARIO')} />
        <BotonMenu texto="MIS GUARDIAS" activo={paginaActual === 'MIS GUARDIAS'} onClick={() => setPagina('MIS GUARDIAS')} />
        <BotonMenu texto="SOLICITAR CAMBIO" activo={paginaActual === 'SOLICITAR CAMBIO'} onClick={() => setPagina('SOLICITAR CAMBIO')} />
        <BotonMenu texto="HISTORIAL" activo={paginaActual === 'HISTORIAL'} onClick={() => setPagina('HISTORIAL')} />
      </nav>
      
      <div className="footer-lateral">
        <BotonMenu texto="CERRAR SESIÓN" esCerrarSesion={true} />
      </div>
    </aside>
  )
}

export default BarraLateral