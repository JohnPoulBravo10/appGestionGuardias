import { Outlet } from 'react-router-dom'

import BarraLateral from '../components/admin/BarraLateral'
import BarraSuperior from '../components/common/layout/BarraSuperior'

import '../components/admin/admin.css'

// Estructura base para las vistas del Administrador: barra lateral, barra superior y contenedor de rutas anidadas (<Outlet />).
function AdminLayout() {
  return (
    <section className="common-center">
      <BarraLateral />

      <main className="common-area-derecha">
        <BarraSuperior />

        <div className="common-contenedor-contenido">
          <Outlet />
        </div>
      </main>
    </section>
  )
}

export default AdminLayout