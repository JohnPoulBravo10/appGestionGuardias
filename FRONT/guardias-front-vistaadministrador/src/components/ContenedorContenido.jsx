import React, { useState } from 'react';
import SolicitarCambio from './SolicitarCambio'
import MisGuardias from './MisGuardias'
import GestionEmpleados from './GestionEmpleados'
import FormularioCrearEmpleado from './FormularioCrearEmpleado'
import GestionGuardias from './GestionGuardias'
import FormularioCrearGuardias from './FormularioCrearGuardias'
import CalendarioGuardias from './CalendarioGuardias';
import EditarGuardia from './EditarGuardia'

function ContenedorContenido({ setPagina, pagina }) {
  const [empleadoEditar, setEmpleadoEditar] = useState(null);
  const [guardiaEditar, setGuardiaEditar] = useState(null);
  return (
    <div className="contenedor-contenido">
      {pagina === 'GESTION DE EMPLEADOS' && (
        <GestionEmpleados
          setPagina={setPagina}
          setEmpleadoEditar={setEmpleadoEditar}
        />
      )}
      {pagina === 'CREAR EMPLEADO' && (
        <FormularioCrearEmpleado
          setPagina={setPagina}
          empleadoEditar={empleadoEditar}
          setEmpleadoEditar={setEmpleadoEditar}
        />
      )}
      {pagina === 'INICIO' && <h3>Bienvenido al Panel</h3>}
      {pagina === 'GESTION DE GUARDIAS' && <GestionGuardias setPagina={setPagina} setGuardiaEditar={setGuardiaEditar} />}
      {pagina === 'CREAR GUARDIAS' && <FormularioCrearGuardias setPagina={setPagina} />}
      {pagina === 'EDITAR GUARDIA' && <EditarGuardia setPagina={setPagina} guardiaEditar={guardiaEditar} setGuardiaEditar={setGuardiaEditar} />}
      {pagina === 'CALENDARIO' && <CalendarioGuardias />}
    </div>
  )
}

export default ContenedorContenido