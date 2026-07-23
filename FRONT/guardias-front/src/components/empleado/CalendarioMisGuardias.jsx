import { useEffect, useState } from 'react'

function CalendarioMisGuardias() {
  const [guardias, setGuardias] = useState([])

  useEffect(() => {
    // cargar guardias
  }, [])

  return (
    <div>
      <h2>Calendario de mis guardias</h2>
    </div>
  )
}

export default CalendarioMisGuardias