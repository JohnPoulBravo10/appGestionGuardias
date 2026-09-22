import { useEffect } from 'react'
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
import HistorialGuardias from './components/admin/HistorialGuardias'

import MiHistorial from './components/empleado/MiHistorial'
import PanelEmpleado from './components/empleado/PanelEmpleado'
import MisGuardias from './components/empleado/MisGuardias'
import SolicitarCambio from './components/empleado/SolicitarCambio'
import CalendarioMisGuardias from './components/empleado/CalendarioMisGuardias'

// Componente raíz de la aplicación: define el enrutamiento general y el título dinámico.
function App() {
  const navigate = useNavigate()
  const location = useLocation()

  // Actualiza dinámicamente el título del documento según el prefijo de la ruta activa
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

  return (
    <Routes>
      {/* Redirección por defecto a Login */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Ruta pública: Formulario de inicio de sesión */}
      <Route
        path="/login"
        element={
          <main className="login-page">
            <LoginForm />
          </main>
        }
      />

      {/* Rutas de Administrador: anidadas bajo AdminLayout (barra de navegación y estructura común) */}
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
            <GestionEmpleados />
          }
        />

        <Route
          path="empleados/nuevo"
          element={
            <FormularioCrearEmpleado />
          }
        />

        <Route
          path="guardias"
          element={
            <GestionGuardias />
          }
        />

        <Route
          path="guardias/nueva"
          element={
            <FormularioCrearGuardias />
          }
        />

        <Route
          path="guardias/editar"
          element={
            <EditarGuardia />
          }
        />

        <Route
          path="historial-guardias"
          element={<HistorialGuardias />}
        />

        <Route
          path="solicitudes"
          element={<GestionSolicitudes />}
        />
      </Route>

      {/* Rutas de Empleado: anidadas bajo EmpleadoLayout */}
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
          element={<MiHistorial />}
        />
      </Route>

      {/* Ruta comodín (404): Redirige y muestra acción para volver al login */}
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