import { useState } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'

import './App.css'

import AdminLayout from './layouts/AdminLayout'
import EmpleadoLayout from './layouts/EmpleadoLayout'

import LoginPage from './pages/auth/LoginPage'

import GestionEmpleados from './components/GestionEmpleados'
import FormularioCrearEmpleado from './components/FormularioCrearEmpleado'
import GestionGuardias from './components/GestionGuardias'
import FormularioCrearGuardias from './components/FormularioCrearGuardias'
import CalendarioGuardias from './components/CalendarioGuardias'
import EditarGuardia from './components/EditarGuardia'

import EmpleadoInicio from './pages/empleado/EmpleadoInicio'
import MisGuardiasPage from './pages/empleado/MisGuardiasPage'
import SolicitarCambioPage from './pages/empleado/SolicitarCambioPage'
import CalendarioEmpleadoPage from './pages/empleado/CalendarioEmpleadoPage'

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
        element={<LoginPage />}
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
          element={<h3>Bienvenido al Panel</h3>}
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
          element={<h3>Solicitudes</h3>}
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
          element={<EmpleadoInicio />}
        />

        <Route
          path="calendario"
          element={<CalendarioEmpleadoPage />}
        />

        <Route
          path="mis-guardias"
          element={<MisGuardiasPage />}
        />

        <Route
          path="solicitar-cambio"
          element={<SolicitarCambioPage />}
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