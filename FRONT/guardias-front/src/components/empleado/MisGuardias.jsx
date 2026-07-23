import { useEffect, useState } from 'react'

import {
  getEmpleadoIdFromToken,
  getToken,
} from '../../utils/authUtils'

const API_BASE_URL = 'http://localhost:8090'

function MisGuardias() {
  const [loading, setLoading] = useState(true)
  const [guardias, setGuardias] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
  const empleadoId = getEmpleadoIdFromToken()

  if (!empleadoId) {
    setError(
      'No se pudo identificar al empleado autenticado.'
    )
    setLoading(false)
    return
  }

  obtenerGuardias(empleadoId)
}, [])

  const obtenerGuardias = async (empleadoId) => {
    setLoading(true)
    setError('')

    try {
      const token = getToken()

      if (!token) {
        throw new Error(
          'No hay una sesión iniciada.'
        )
      }

      const response = await fetch(
        `${API_BASE_URL}/api/guardias/empleado/${empleadoId}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            'Tu sesión no es válida o expiró.'
          )
        }

        if (response.status === 403) {
          throw new Error(
            'No tenés permisos para consultar estas guardias.'
          )
        }

        if (response.status === 404) {
          throw new Error(
            'No se encontró el empleado autenticado.'
          )
        }

        throw new Error(
          `Error al obtener guardias (${response.status}).`
        )
      }

      const data = await response.json()

      setGuardias(
        Array.isArray(data) ? data : []
      )
    } catch (error) {
      console.error(
        'Error al obtener guardias:',
        error
      )

      setError(
        error.message ||
          'Ocurrió un error al cargar las guardias.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tabla-container">
      <h3 style={{ marginBottom: '20px' }}>
        MIS GUARDIAS
      </h3>

      {loading && (
        <p>Cargando guardias...</p>
      )}

      {!loading && error && (
        <p className="mensaje-error">
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        guardias.length === 0 && (
          <p>No tenés guardias asignadas.</p>
        )}

      {!loading &&
        !error &&
        guardias.length > 0 && (
          <table className="tabla-guardias">
            <thead>
              <tr>
                <th>FECHA</th>
                <th>HORARIO</th>
                <th>ÁREA</th>
                <th>ESTADO</th>
              </tr>
            </thead>

            <tbody>
              {guardias.map((guardia) => (
                <tr key={guardia.id}>
                  <td>{guardia.fecha}</td>

                  <td>
                    {guardia.horaInicio} -{' '}
                    {guardia.horaFin}
                  </td>

                  <td>{guardia.rol}</td>

                  <td>
                    <span className="badge">
                      {guardia.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  )
}

export default MisGuardias