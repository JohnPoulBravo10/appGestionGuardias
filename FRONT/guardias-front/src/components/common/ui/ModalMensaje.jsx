import React, { useEffect } from 'react'

import '../common.css'

function ModalMensaje({
  visible,
  tipo = 'exito',
  titulo,
  mensaje,
  onCerrar,
}) {
  useEffect(() => {
    if (!visible) {
      return
    }

    const cerrarConEscape = (event) => {
      if (event.key === 'Escape') {
        onCerrar()
      }
    }

    document.addEventListener(
      'keydown',
      cerrarConEscape
    )

    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener(
        'keydown',
        cerrarConEscape
      )

      document.body.style.overflow = ''
    }
  }, [visible, onCerrar])

  if (!visible) {
    return null
  }

  const cerrarDesdeFondo = (event) => {
    if (event.target === event.currentTarget) {
      onCerrar()
    }
  }

  return (
    <div
      className="common-modal-overlay"
      onClick={cerrarDesdeFondo}
    >
      <div
        className={`common-modal-dialogo common-modal-mensaje-dialogo common-modal-mensaje-${tipo}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-mensaje"
      >
        <div className="common-modal-icono">
          {tipo === 'exito' ? '✓' : '!'}
        </div>

        <h3
          id="titulo-modal-mensaje"
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
            className="common-modal-btn common-modal-btn-aceptar"
            onClick={onCerrar}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalMensaje