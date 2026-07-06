import React from 'react'
import BotonMenu from './BotonMenu'

function BarraLateral({ paginaActual, setPagina }) {
  return (
    <aside className="barralateral">
      <div className="perfil">
        <div className="foto-perfil">👤</div>
        <h3>JUAN PABLO<br/>BRAVO</h3>
        <p>ADMINISTRADOR</p>
      </div>

      <nav className="menu">
        <BotonMenu texto="INICIO" activo={paginaActual === 'INICIO'} onClick={() => setPagina('INICIO')} />
        <BotonMenu texto="GESTIÓN EMPLEADOS" activo={(paginaActual === 'GESTION EMPLEADOS' || paginaActual === 'CREAR EMPLEADO')} onClick={() => setPagina('GESTION EMPLEADOS')} />
        <BotonMenu texto="GESTIÓN GUARDIAS" activo={paginaActual === 'GESTION GUARDIAS' || paginaActual === 'CREAR GUARDIAS'} onClick={() => setPagina('GESTION GUARDIAS')} />
        <BotonMenu texto="SOLICITUDES" activo={paginaActual === 'SOLICITUDES'} onClick={() => setPagina('SOLICITUDES')} />
      </nav>
      
      <div className="footer-lateral">
        <BotonMenu texto="CERRAR SESIÓN" esCerrarSesion={true} />
      </div>
    </aside>
  )
}

export default BarraLateral