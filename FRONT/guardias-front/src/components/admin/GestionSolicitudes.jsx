import useGestionSolicitudes from '../../hooks/useGestionSolicitudes'
import ModalResolucionSolicitud from './ModalResolucionSolicitud'

/**
 * Pantalla "Solicitudes de Cambio" del módulo administrador.
 *
 * Muestra una tabla con todas las solicitudes en estado PENDIENTE.
 * Cada fila tiene botones de acción (aprobar / rechazar) que abren
 * un modal de resolución.
 */
function GestionSolicitudes() {
  const {
    solicitudes,
    empleados,

    cargando,
    error,
    setError,

    modalAbierto,
    solicitudActiva,
    accionModal,
    procesando,
    abrirModal,
    cerrarModal,
    resolverSolicitud,

    formatearHora,
  } = useGestionSolicitudes()

  /**
   * Formatea la información de la guardia original
   * para mostrar en la columna de la tabla.
   */
  const formatearGuardia = (infoGuardia) => {
    if (!infoGuardia) return 'Sin información'

    const fecha = infoGuardia.fecha || 'Sin fecha'

    const horaInicio = formatearHora(
      infoGuardia.horaInicio
    )

    const horaFin = formatearHora(
      infoGuardia.horaFin
    )

    return `${fecha} (${horaInicio} - ${horaFin})`
  }

  return (
    <div className="admin-tabla-container">
      <div className="admin-header-tabla">
        <h3>Solicitudes de Cambio</h3>
      </div>

      {/* ── Mensaje de error ── */}
      {error && (
        <p className="admin-panel-error">
          {error}
          <button
            type="button"
            className="admin-btn-cerrar-error"
            onClick={() => setError('')}
            aria-label="Cerrar mensaje de error"
          >
            ✕
          </button>
        </p>
      )}

      {/* ── Estado de carga ── */}
      {cargando && (
        <p className="admin-panel-cargando">
          Cargando solicitudes…
        </p>
      )}

      {/* ── Sin solicitudes ── */}
      {!cargando &&
        !error &&
        solicitudes.length === 0 && (
          <p className="admin-panel-vacio">
            No hay solicitudes pendientes.
          </p>
        )}

      {/* ── Tabla de solicitudes ── */}
      {!cargando && solicitudes.length > 0 && (
        <table className="admin-tabla-solicitudes">
          <thead>
            <tr>
              <th>Solicitante</th>
              <th>Guardia Original</th>
              <th>Empleado Propuesto</th>
              <th>Motivo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {solicitudes.map((solicitud) => (
              <tr key={solicitud.id}>
                <td>
                  {solicitud.nombreEmpleado}
                </td>

                <td>
                  {formatearGuardia(
                    solicitud.infoGuardia
                  )}
                </td>

                <td>
                  {solicitud.nombreEmpleadoReemplazo ||
                    'Sin asignar'}
                </td>

                <td>{solicitud.motivo}</td>

                <td className="admin-acciones">
                  {/* Botón aprobar (verde) */}
                  <button
                    type="button"
                    className="admin-btn-accion-aprobar"
                    title="Aprobar solicitud"
                    aria-label={`Aprobar solicitud de ${solicitud.nombreEmpleado}`}
                    onClick={() =>
                      abrirModal(
                        solicitud,
                        'aprobar'
                      )
                    }
                  >
                    ✓
                  </button>

                  {/* Botón rechazar (rojo) */}
                  <button
                    type="button"
                    className="admin-btn-accion-rechazar"
                    title="Rechazar solicitud"
                    aria-label={`Rechazar solicitud de ${solicitud.nombreEmpleado}`}
                    onClick={() =>
                      abrirModal(
                        solicitud,
                        'rechazar'
                      )
                    }
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── Modal de resolución ── */}
      <ModalResolucionSolicitud
        visible={modalAbierto}
        solicitud={solicitudActiva}
        accion={accionModal}
        empleados={empleados}
        procesando={procesando}
        onConfirmar={resolverSolicitud}
        onCancelar={cerrarModal}
      />
    </div>
  )
}

export default GestionSolicitudes
