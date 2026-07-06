import React from 'react'
import SolicitarCambio from './SolicitarCambio'
import MisGuardias from './MisGuardias'

function ContenedorContenido({ pagina }) {
  return (
    <div className="contenedor-contenido">
      {pagina === 'SOLICITAR CAMBIO' && (
        <SolicitarCambio></SolicitarCambio>
      )}
       {pagina === 'MIS GUARDIAS' && (
        <MisGuardias></MisGuardias>
      )}
      { pagina !== 'SOLICITAR CAMBIO' && pagina !== 'MIS GUARDIAS' && (
        <h3>Estás en la sección: {pagina}</h3>
      )}
    </div>
  )
}

export default ContenedorContenido