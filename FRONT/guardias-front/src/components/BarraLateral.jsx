import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { cerrarSesion } from '../utils/authUtils'

function BarraLateral() {
  const navigate = useNavigate()

  return (
    <aside className="barralateral">
      <div className="perfil">
        <div className="foto-perfil">👤</div>

        <h3>
          JUAN PABLO
          <br />
          BRAVO
        </h3>

        <p>ADMINISTRADOR</p>
      </div>

      <nav className="menu">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `btn-menu ${isActive ? 'activo' : ''}`
          }
        >
          INICIO
        </NavLink>

        <NavLink
          to="/admin/calendario"
          className={({ isActive }) =>
            `btn-menu ${isActive ? 'activo' : ''}`
          }
        >
          CALENDARIO
        </NavLink>

        <NavLink
          to="/admin/empleados"
          className={({ isActive }) =>
            `btn-menu ${isActive ? 'activo' : ''}`
          }
        >
          GESTIÓN EMPLEADOS
        </NavLink>

        <NavLink
          to="/admin/guardias"
          className={({ isActive }) =>
            `btn-menu ${isActive ? 'activo' : ''}`
          }
        >
          GESTIÓN GUARDIAS
        </NavLink>

        <NavLink
          to="/admin/solicitudes"
          className={({ isActive }) =>
            `btn-menu ${isActive ? 'activo' : ''}`
          }
        >
          SOLICITUDES
        </NavLink>
      </nav>

      <div className="footer-lateral">
        <button
          type="button"
          className="btn-menu cerrar-sesion"
          onClick={() => {
            cerrarSesion()
            navigate('/login')
          }}
        >
          CERRAR SESIÓN
        </button>
      </div>
    </aside>
  )
}

export default BarraLateral