import './App.css'
import LoginForm from './components/LoginForm'

/**
 * App — Componente raíz de la vista de login.
 * Renderiza la página de login centrada en pantalla completa.
 */
function App() {
  return (
    <main className="login-page">
      <LoginForm />
    </main>
  )
}

export default App
