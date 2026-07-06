import React from 'react'
import SolicitarCambio from './SolicitarCambio'
import MisGuardias from './MisGuardias'
import GestionEmpleados from './GestionEmpleados'
import FormularioCrearEmpleado from './FormularioCrearEmpleado'
import GestionGuardias from './GestionGuardias'
import FormularioCrearGuardias from './FormularioCrearGuardias'

function ContenedorContenido({ setPagina,pagina }) {
  return (
    <div className="contenedor-contenido">
      {pagina === 'GESTION EMPLEADOS' && <GestionEmpleados setPagina={setPagina} />}
      {pagina === 'CREAR EMPLEADO' && <FormularioCrearEmpleado setPagina={setPagina} />}
      {pagina === 'INICIO' && <h3>Bienvenido al Panel</h3>}
      {pagina === 'GESTION GUARDIAS' && <GestionGuardias setPagina={setPagina} />}
      {pagina === 'CREAR GUARDIAS' && <FormularioCrearGuardias setPagina={setPagina} />}
    </div>
  )
}

export default ContenedorContenido