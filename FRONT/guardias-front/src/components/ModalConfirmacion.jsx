import React, { useEffect, useRef } from 'react'

function ModalConfirmacion({
  visible,
  titulo,
  mensaje,
  onConfirmar,
  onCancelar,
}) {
  const dialogRef = useRef(null)

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

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onCancelar()
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        className="modal-dialogo"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-cerrar-sesion"
      >
        <h3
          id="titulo-modal-cerrar-sesion"
          className="modal-titulo"
        >
          {titulo}
        </h3>

        <p className="modal-mensaje">
          {mensaje}
        </p>

        <div className="modal-acciones">
          <button
            type="button"
            className="modal-btn modal-btn-cancelar"
            onClick={onCancelar}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="modal-btn modal-btn-confirmar"
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