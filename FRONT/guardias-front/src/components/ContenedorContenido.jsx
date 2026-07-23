import React, { useState } from 'react'

import GestionEmpleados from './GestionEmpleados'
import FormularioCrearEmpleado from './FormularioCrearEmpleado'
import GestionGuardias from './GestionGuardias'
import FormularioCrearGuardias from './FormularioCrearGuardias'
import CalendarioGuardias from './CalendarioGuardias'
import EditarGuardia from './EditarGuardia'

function ContenedorContenido({ setPagina, pagina }) {
  const [empleadoEditar, setEmpleadoEditar] = useState(null)
  const [guardiaEditar, setGuardiaEditar] = useState(null)

  return (
    <div className="contenedor-contenido">
      {pagina === 'INICIO' && (
        <h3>Bienvenido al Panel</h3>
      )}

      {pagina === 'CALENDARIO' && (
        <CalendarioGuardias />
      )}

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

      {pagina === 'GESTION GUARDIAS' && (
        <GestionGuardias
          setPagina={setPagina}
          setGuardiaEditar={setGuardiaEditar}
        />
      )}

      {pagina === 'CREAR GUARDIAS' && (
        <FormularioCrearGuardias
          setPagina={setPagina}
        />
      )}

      {pagina === 'EDITAR GUARDIA' && (
        <EditarGuardia
          setPagina={setPagina}
          guardiaEditar={guardiaEditar}
          setGuardiaEditar={setGuardiaEditar}
        />
      )}

      {pagina === 'SOLICITUDES' && (
        <h3>Solicitudes</h3>
      )}
    </div>
  )
}

export default ContenedorContenido