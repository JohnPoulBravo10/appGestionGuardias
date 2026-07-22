import React, { useEffect, useRef } from 'react'

/**
 * ModalConfirmacion — Diálogo modal reutilizable para confirmar acciones.
 *
 * Renderiza un overlay con un cuadro de diálogo centrado que respeta la
 * estética oscura de la aplicación. Se cierra al pulsar Escape o al hacer
 * clic fuera del cuadro.
 *
 * @param {{ visible: boolean, titulo: string, mensaje: string, onConfirmar: Function, onCancelar: Function }} props
 */
function ModalConfirmacion({ visible, titulo, mensaje, onConfirmar, onCancelar }) {
  const dialogRef = useRef(null)

  /** Cierra el modal al pulsar la tecla Escape */
  useEffect(() => {
    if (!visible) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancelar()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [visible, onCancelar])

  if (!visible) return null

  /**
   * Cierra el modal al hacer clic en el overlay (fuera del cuadro).
   * Se verifica que el clic no sea sobre el contenido del diálogo.
   */
  const handleOverlayClick = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onCancelar()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-dialogo" ref={dialogRef}>
        <h3 className="modal-titulo">{titulo}</h3>
        <p className="modal-mensaje">{mensaje}</p>
        <div className="modal-acciones">
          <button
            className="modal-btn modal-btn-cancelar"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
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
