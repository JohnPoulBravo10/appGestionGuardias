import React, { useEffect, useRef } from 'react'
import '../common.css'

// Modal de confirmación genérico: solicita confirmación al usuario ante acciones críticas (ej: cerrar sesión o eliminar).
function ModalConfirmacion({
  visible,
  titulo,
  mensaje,
  onConfirmar,
  onCancelar,
}) {
  const dialogRef = useRef(null)

  // Cierra con Escape y bloquea el scroll de la página mientras el modal esté visible
  useEffect(() => {
    if (!visible) {
      return
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancelar()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [visible, onCancelar])

  if (!visible) {
    return null
  }

  // Cierra el modal al hacer clic en el backdrop/overlay
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onCancelar()
    }
  }

  return (
    <div
      className="common-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        className="common-modal-dialogo"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-cerrar-sesion"
      >
        <h3
          id="titulo-modal-cerrar-sesion"
          className="common-modal-titulo"
        >
          {titulo}
        </h3>

        <p className="common-modal-mensaje">
          {mensaje}
        </p>

        <div className="common-modal-acciones">
          <button
            type="button"
            className="common-modal-btn common-modal-btn-cancelar"
            onClick={onCancelar}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="common-modal-btn common-modal-btn-confirmar"
            onClick={onConfirmar}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalConfirmacion