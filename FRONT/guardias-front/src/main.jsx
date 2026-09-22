import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import App from './App.jsx'

// Punto de entrada de la aplicación: inicializa el montaje en el DOM
// envolviendo la app con StrictMode y el proveedor de enrutamiento (BrowserRouter).
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
