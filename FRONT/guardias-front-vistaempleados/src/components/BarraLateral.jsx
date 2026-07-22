import React, { useState, useCallback } from 'react'
import BotonMenu from './BotonMenu'
import UserIcon from './UserIcon'
import ModalConfirmacion from './ModalConfirmacion'
import useUsuarioActual from '../hooks/useUsuarioActual'

/** URL de la vista de login (puerto configurado en vite.config del login) */
const LOGIN_URL = 'http://localhost:5175'

/**
 * BarraLateral — Panel lateral con perfil del usuario y menú de navegación.
 *
 * Obtiene dinámicamente el nombre, apellido y rol del empleado autenticado
 * a través del hook useUsuarioActual (que lee el JWT de localStorage).
 *
 * @param {{ paginaActual: string, setPagina: Function }} props
 */
function BarraLateral({ paginaActual, setPagina }) {
  const { empleado, isLoading, error } = useUsuarioActual()
  const [mostrarModalLogout, setMostrarModalLogout] = useState(false)

  /** Formatea el nombre para mostrar en mayúsculas */
  const nombreDisplay = empleado
    ? `${empleado.nombre.toUpperCase()}`
    : ''
  const apellidoDisplay = empleado
    ? `${empleado.apellido.toUpperCase()}`
    : ''
  const rolDisplay = empleado
    ? empleado.rol
    : ''

  /** Abre el modal de confirmación de cierre de sesión */
  const handleCerrarSesionClick = useCallback(() => {
    setMostrarModalLogout(true)
  }, [])

  /** Cancela el cierre de sesión y oculta el modal */
  const handleCancelarLogout = useCallback(() => {
    setMostrarModalLogout(false)
  }, [])

  /**
   * Confirma el cierre de sesión: limpia el token JWT de
   * localStorage y redirige al usuario a la pantalla de login.
   */
  const handleConfirmarLogout = useCallback(() => {
    localStorage.removeItem('token')
    window.location.href = LOGIN_URL
  }, [])

  return (
    <>
      <aside className="barralateral">
        <div className="perfil">
          <UserIcon className="user-icon" />
          {isLoading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p>Error al cargar perfil</p>
          ) : (
            <>
              <h3>{nombreDisplay}<br />{apellidoDisplay}</h3>
              <p>{rolDisplay}</p>
            </>
          )}
        </div>

        <nav className="menu">
          <BotonMenu texto="INICIO" activo={paginaActual === 'INICIO'} onClick={() => setPagina('INICIO')} />
          <BotonMenu texto="CALENDARIO" activo={paginaActual === 'CALENDARIO'} onClick={() => setPagina('CALENDARIO')} />
          <BotonMenu texto="MIS GUARDIAS" activo={paginaActual === 'MIS GUARDIAS'} onClick={() => setPagina('MIS GUARDIAS')} />
          <BotonMenu texto="SOLICITAR CAMBIO" activo={paginaActual === 'SOLICITAR CAMBIO'} onClick={() => setPagina('SOLICITAR CAMBIO')} />
          <BotonMenu texto="HISTORIAL" activo={paginaActual === 'HISTORIAL'} onClick={() => setPagina('HISTORIAL')} />
        </nav>

        <div className="footer-lateral">
          <BotonMenu texto="CERRAR SESIÓN" esCerrarSesion={true} onClick={handleCerrarSesionClick} />
        </div>
      </aside>

      <ModalConfirmacion
        visible={mostrarModalLogout}
        titulo="Cerrar Sesión"
        mensaje="¿Estás seguro de que deseas cerrar sesión?"
        onConfirmar={handleConfirmarLogout}
        onCancelar={handleCancelarLogout}
      />
    </>
  )
}

export default BarraLateral