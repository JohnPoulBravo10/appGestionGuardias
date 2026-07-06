import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import BarraLateral from './components/BarraLateral'
import BarraSuperior from './components/BarraSuperior'
import SolicitarCambio from './components/SolicitarCambio'
import ContenedorContenido from './components/ContenedorContenido'

function App() {
  const [count, setCount] = useState(0)
  const [pagina, setPagina] = useState('SOLICITAR CAMBIO')

  return (
      <section className="center">
      <BarraLateral paginaActual={pagina} setPagina={setPagina} />
      <main className="area-derecha">
        <BarraSuperior />
        <ContenedorContenido pagina={pagina} />
      </main>
    </section>
   
  )
}

export default App
