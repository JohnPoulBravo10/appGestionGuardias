import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { cerrarSesion } from '../utils/authUtils'
import UserIcon from './UserIcon'
import LogoutIcon from './LogoutIcon'
import ModalConfirmacion from './ModalConfirmacion'
import useUsuarioActual from '../hooks/useUsuarioActual'

function BarraLateral() {
  const navigate = useNavigate()
  const [mostrarModal, setMostrarModal] = useState(false)
 
  

  const {
    empleado,
    isLoading,
    error,
  } = useUsuarioActual()

  const handleCerrarSesion = () => {
    cerrarSesion()
    setMostrarModal(false)

    navigate('/login', {
      replace: true,
    })
  }

  const nombre = empleado?.nombre || ''
  const apellido = empleado?.apellido || ''

  const rol =
    empleado?.rol ||
    empleado?.usuario?.rol ||
    'ADMINISTRADOR'

  const obtenerClaseMenu = ({ isActive }) =>
    `btn-menu ${isActive ? 'activo' : ''}`

  return (
    <>
      <aside className="barralateral">
        <div className="perfil">
          <div className="foto-perfil">
            <UserIcon className="icono-usuario" />
          </div>

          {isLoading && (
            <p>Cargando usuario...</p>
          )}

          {!isLoading && error && (
            <p>No se pudo cargar el usuario</p>
          )}

          {!isLoading && !error && empleado && (
            <>
              <h3>
                {nombre.toUpperCase()}
                <br />
                {apellido.toUpperCase()}
              </h3>

              <p>{String(rol).toUpperCase()}</p>
            </>
          )}
        </div>

        <nav className="menu">
          <NavLink
            to="/admin"
            end
            className={obtenerClaseMenu}
          >
            INICIO
          </NavLink>

          <NavLink
            to="/admin/calendario"
            className={obtenerClaseMenu}
          >
            CALENDARIO
          </NavLink>

          <NavLink
            to="/admin/empleados"
            className={obtenerClaseMenu}
          >
            GESTIÓN EMPLEADOS
          </NavLink>

          <NavLink
            to="/admin/guardias"
            className={obtenerClaseMenu}
          >
            GESTIÓN GUARDIAS
          </NavLink>

          <NavLink
            to="/admin/solicitudes"
            className={obtenerClaseMenu}
          >
            SOLICITUDES
          </NavLink>
        </nav>

        <div className="footer-lateral">
          <button
            type="button"
            className="btn-cerrar-sesion"
            onClick={() => setMostrarModal(true)}
          >
            <LogoutIcon className="icono-logout" />

            <span>
              CERRAR
              <br />
              SESIÓN
            </span>
          </button>
        </div>
      </aside>

      <ModalConfirmacion
        visible={mostrarModal}
        titulo="Cerrar sesión"
        mensaje="¿Está seguro de que desea cerrar sesión?"
        onConfirmar={handleCerrarSesion}
        onCancelar={() => setMostrarModal(false)}
      />
    </>
  )
}

export default BarraLateral