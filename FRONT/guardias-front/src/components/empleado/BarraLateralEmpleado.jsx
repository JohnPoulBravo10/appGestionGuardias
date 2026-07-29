import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import ModalConfirmacion from '../common/ui/ModalConfirmacion'
import UserIcon from '../common/icons/UserIcon'
import LogoutIcon from '../common/icons/LogoutIcon'

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
    `common-btn-menu ${isActive ? 'activo' : ''}`

  const nombre = empleado?.nombre || ''
  const apellido = empleado?.apellido || ''

  const rol =
    empleado?.rol ||
    empleado?.usuario?.rol ||
    'ENFERMERÍA'

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
        onConfirmar={confirmarCierreSesion}
        onCancelar={() => setMostrarModal(false)}
      />
    </>
  )
}

export default BarraLateralEmpleado