import { Outlet } from 'react-router-dom'

import BarraLateral from '../components/BarraLateral'
import BarraSuperior from '../components/BarraSuperior'

function AdminLayout() {
  return (
    <section className="center">
      <BarraLateral />

      <main className="area-derecha">
        <BarraSuperior />

        <div className="contenedor-contenido">
          <Outlet />
        </div>
      </main>
    </section>
  )
}

export default AdminLayout