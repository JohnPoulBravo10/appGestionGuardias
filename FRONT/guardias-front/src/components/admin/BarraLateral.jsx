import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { cerrarSesion } from '../../utils/authUtils'
import UserIcon from '../common/icons/UserIcon'
import LogoutIcon from '../common/icons/LogoutIcon'
import ModalConfirmacion from '../common/ui/ModalConfirmacion'
import useUsuarioActual from '../../hooks/useUsuarioActual'

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
    `common-btn-menu ${isActive ? 'activo' : ''}`

  return (
    <>
      <aside className="common-barralateral">
        <div className="common-perfil">
          <div className="foto-perfil">
            <UserIcon className="common-icono-usuario" />
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

        <nav className="common-menu">
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
            className="common-cerrar-sesion"
            onClick={() => setMostrarModal(true)}
          >
            <LogoutIcon className="common-logout-icon" />

            <span>
              CERRAR SESIÓN
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
