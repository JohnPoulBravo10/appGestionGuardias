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
import HistorialGuardias from './components/admin/HistorialGuardias'

import MiHistorial from './components/empleado/MiHistorial'
import PanelEmpleado from './components/empleado/PanelEmpleado'
import MisGuardias from './components/empleado/MisGuardias'
import SolicitarCambio from './components/empleado/SolicitarCambio'
import CalendarioMisGuardias from './components/empleado/CalendarioMisGuardias'

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
          element={<MiHistorial />}
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