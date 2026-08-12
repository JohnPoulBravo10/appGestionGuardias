import { useState, useEffect } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from 'react-router-dom'

import './App.css'
import './components/common/common.css'

import AdminLayout from './layouts/AdminLayout'
import EmpleadoLayout from './layouts/EmpleadoLayout'

import LoginForm from './components/login/LoginForm'
import './components/login/login.css'

import GestionEmpleados from './components/admin/GestionEmpleados'
import FormularioCrearEmpleado from './components/admin/FormularioCrearEmpleado'
import GestionGuardias from './components/admin/GestionGuardias'
import FormularioCrearGuardias from './components/admin/FormularioCrearGuardias'
import CalendarioGuardias from './components/admin/CalendarioGuardias'
import EditarGuardia from './components/admin/EditarGuardia'
import PanelPrincipal from './components/admin/PanelPrincipal'
import GestionSolicitudes from './components/admin/GestionSolicitudes'

import PanelEmpleado from './components/empleado/PanelEmpleado'
import MisGuardias from './components/empleado/MisGuardias'
import SolicitarCambio from './components/empleado/SolicitarCambio'
import CalendarioMisGuardias from './components/empleado/CalendarioMisGuardias'

const rutaPorPagina = {
  INICIO: '/admin',
  CALENDARIO: '/admin/calendario',

  'GESTION EMPLEADOS': '/admin/empleados',
  'CREAR EMPLEADO': '/admin/empleados/nuevo',

  'GESTION GUARDIAS': '/admin/guardias',
  'CREAR GUARDIAS': '/admin/guardias/nueva',
  'EDITAR GUARDIA': '/admin/guardias/editar',

  SOLICITUDES: '/admin/solicitudes',
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname

    if (path.startsWith('/admin')) {
      document.title = 'SGGS — Vista Administrador'
    } else if (path.startsWith('/empleado')) {
      document.title = 'SGGS — Vista Empleado'
    } else if (path.startsWith('/login')) {
      document.title = 'SGGS — Login'
    } else {
      document.title = 'SGGS'
    }
  }, [location.pathname])

  const [empleadoEditar, setEmpleadoEditar] = useState(null)
  const [guardiaEditar, setGuardiaEditar] = useState(null)

  const setPagina = (nombrePagina) => {
    const ruta = rutaPorPagina[nombrePagina]

    if (!ruta) {
      console.error(
        `No existe una ruta para la página: ${nombrePagina}`
      )
      return
    }

    navigate(ruta)
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={
          <main className="login-page">
            <LoginForm />
          </main>
        }
      />

      {/* =========================
          RUTAS DE ADMINISTRADOR
          ========================= */}
      <Route
        path="/admin"
        element={<AdminLayout />}
      >
        <Route
          index
          element={<PanelPrincipal />}
        />

        <Route
          path="calendario"
          element={<CalendarioGuardias />}
        />

        <Route
          path="empleados"
          element={
            <GestionEmpleados
              setPagina={setPagina}
              setEmpleadoEditar={setEmpleadoEditar}
            />
          }
        />

        <Route
          path="empleados/nuevo"
          element={
            <FormularioCrearEmpleado
              setPagina={setPagina}
              empleadoEditar={empleadoEditar}
              setEmpleadoEditar={setEmpleadoEditar}
            />
          }
        />

        <Route
          path="guardias"
          element={
            <GestionGuardias
              setPagina={setPagina}
              setGuardiaEditar={setGuardiaEditar}
            />
          }
        />

        <Route
          path="guardias/nueva"
          element={
            <FormularioCrearGuardias
              setPagina={setPagina}
            />
          }
        />

        <Route
          path="guardias/editar"
          element={
            <EditarGuardia
              setPagina={setPagina}
              guardiaEditar={guardiaEditar}
              setGuardiaEditar={setGuardiaEditar}
            />
          }
        />

        <Route
          path="solicitudes"
          element={<GestionSolicitudes />}
        />
      </Route>

      {/* =========================
          RUTAS DE EMPLEADO
          ========================= */}
      <Route
        path="/empleado"
        element={<EmpleadoLayout />}
      >
        <Route
          index
          element={<PanelEmpleado />}
        />

        <Route
          path="calendario"
          element={<CalendarioMisGuardias />}
        />

        <Route
          path="mis-guardias"
          element={<MisGuardias />}
        />

        <Route
          path="solicitar-cambio"
          element={<SolicitarCambio />}
        />

        <Route
          path="historial"
          element={
            <div>
              <h2>Historial</h2>
              <p>
                Próximamente se mostrará el historial de guardias.
              </p>
            </div>
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <div>
            <h3>Página no encontrada</h3>

            <button
              type="button"
              onClick={() => navigate('/login')}
            >
              Volver al login
            </button>
          </div>
        }
      />
    </Routes>
  )
}

export default App