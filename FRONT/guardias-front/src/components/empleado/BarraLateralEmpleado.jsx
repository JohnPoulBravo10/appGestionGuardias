import { NavLink, useNavigate } from 'react-router-dom'

function BarraLateralEmpleado() {
  const navigate = useNavigate()

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    navigate('/login', {
      replace: true,
    })
  }

  const claseMenu = ({ isActive }) =>
    `btn-menu ${isActive ? 'activo' : ''}`

  return (
    <aside className="barralateral">
      <div className="perfil">
        <div className="foto-perfil">
          👤
        </div>

        <h3>
          JUAN PABLO
          <br />
          BRAVO
        </h3>

        <p>ENFERMERÍA</p>
      </div>

      <nav className="menu">
        <NavLink
          to="/empleado"
          end
          className={claseMenu}
        >
          INICIO
        </NavLink>

        <NavLink
          to="/empleado/calendario"
          className={claseMenu}
        >
          CALENDARIO
        </NavLink>

        <NavLink
          to="/empleado/mis-guardias"
          className={claseMenu}
        >
          MIS GUARDIAS
        </NavLink>

        <NavLink
          to="/empleado/solicitar-cambio"
          className={claseMenu}
        >
          SOLICITAR CAMBIO
        </NavLink>

        <NavLink
          to="/empleado/historial"
          className={claseMenu}
        >
          HISTORIAL
        </NavLink>
      </nav>

      <div className="footer-lateral">
        <button
          type="button"
          className="btn-menu cerrar-sesion"
          onClick={cerrarSesion}
        >
          CERRAR SESIÓN
        </button>
      </div>
    </aside>
  )
}

export default BarraLateralEmpleado