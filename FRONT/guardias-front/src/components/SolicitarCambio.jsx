import React from 'react'

function SolicitarCambio() {
  return (
      <div className='div_solicitar_cambio'>
      <h2 className="titulo-formulario">Solicitar Cambio de Guardia</h2>
      
      <label className="label-form">Seleccionar Guardia a Cambiar</label>
      <select className="input-estilo">
        <option>Mañana, 28/05/2026 (08:00 - 16:00) - UTI</option>
      </select>

      <label className="label-form">Compañero Propuesto (Opcional)</label>
      <select className="input-estilo">
        <option>Seleccione un compañero (opcional)</option>
      </select>
      <p className="texto-ayuda">Si no propones a nadie, la solicitud quedará abierta para que otro empleado o administrador la asigne.</p>

      <label className="label-form">Motivo del Cambio</label>
      <textarea className="input-estilo area-texto" placeholder="Escribe brevemente el motivo de tu solicitud..."></textarea>

      <div className="contenedor-boton">
        <button className="btn-enviar">✈️ Enviar Solicitud</button>
      </div>
    </div>
  )
}

export default SolicitarCambio