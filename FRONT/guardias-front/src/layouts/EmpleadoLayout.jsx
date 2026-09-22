import { Outlet } from 'react-router-dom'

import BarraLateralEmpleado from '../components/empleado/BarraLateralEmpleado'
import BarraSuperior from '../components/common/layout/BarraSuperior'

import '../components/empleado/empleado.css'

// Estructura base para las vistas del Empleado: barra lateral, barra superior y contenedor de rutas anidadas (<Outlet />).
function EmpleadoLayout() {
  return (
    <section className="common-center">
      <BarraLateralEmpleado />

      <main className="common-area-derecha">
        <BarraSuperior />

        <div className="common-contenedor-contenido">
          <Outlet />
        </div>
      </main>
    </section>
  )
}

export default EmpleadoLayout