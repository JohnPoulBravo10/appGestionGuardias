import { Outlet } from 'react-router-dom'

import BarraLateralEmpleado from '../components/empleado/BarraLateralEmpleado'
import BarraSuperior from '../components/BarraSuperior'

import '../components/empleado/EmpleadoPages.css'

function EmpleadoLayout() {
  return (
    <section className="center">
      <BarraLateralEmpleado />

      <main className="area-derecha">
        <BarraSuperior />

        <div className="contenedor-contenido">
          <Outlet />
        </div>
      </main>
    </section>
  )
}

export default EmpleadoLayout