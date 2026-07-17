import React, { useState } from 'react';
import SolicitarCambio from './SolicitarCambio'
import MisGuardias from './MisGuardias'
import GestionEmpleados from './GestionEmpleados'
import FormularioCrearEmpleado from './FormularioCrearEmpleado'
import GestionGuardias from './GestionGuardias'
import FormularioCrearGuardias from './FormularioCrearGuardias'

function ContenedorContenido({ setPagina,pagina }) {
  const [empleadoEditar, setEmpleadoEditar] = useState(null);
  return (
    <div className="contenedor-contenido">
      {pagina === 'GESTION EMPLEADOS' && (
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
      {pagina === 'GESTION GUARDIAS' && <GestionGuardias setPagina={setPagina} />}
      {pagina === 'CREAR GUARDIAS' && <FormularioCrearGuardias setPagina={setPagina} />}
    </div>
  )
}

export default ContenedorContenido