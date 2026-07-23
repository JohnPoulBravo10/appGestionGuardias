import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import ModalConfirmacion from '../ModalConfirmacion'
import UserIcon from '../UserIcon'
import LogoutIcon from '../LogoutIcon'

import useUsuarioActual from '../../hooks/useUsuarioActual'
import { cerrarSesion } from '../../utils/authUtils'

function BarraLateralEmpleado() {
  const navigate = useNavigate()

  const [mostrarModal, setMostrarModal] = useState(false)

  const {
    empleado,
    isLoading,
    error,
  } = useUsuarioActual()

  const confirmarCierreSesion = () => {
    cerrarSesion()
    setMostrarModal(false)

    navigate('/login', {
      replace: true,
    })
  }

  const claseMenu = ({ isActive }) =>
    `btn-menu ${isActive ? 'activo' : ''}`

  const nombre = empleado?.nombre || ''
  const apellido = empleado?.apellido || ''

  const rol =
    empleado?.rol ||
    empleado?.usuario?.rol ||
    'ENFERMERÍA'

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
        onConfirmar={confirmarCierreSesion}
        onCancelar={() => setMostrarModal(false)}
      />
    </>
  )
}

export default BarraLateralEmpleado