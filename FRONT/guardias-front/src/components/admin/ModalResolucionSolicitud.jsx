import { useState, useEffect } from 'react'

// Modal de resolución de solicitudes de cambio: permite aprobar (con asignación obligatoria de empleado) o rechazar una solicitud.
function ModalResolucionSolicitud({
  visible,
  solicitud,
  accion,
  empleados,
  procesando,
  onConfirmar,
  onCancelar,
}) {
  const [empleadoDni, setEmpleadoDni] = useState('')
  const [observacion, setObservacion] = useState('')
  const [errorLocal, setErrorLocal] = useState('')

  // Pre-selecciona el empleado propuesto si ya fue sugerido por el solicitante
  useEffect(() => {
    if (visible && solicitud) {
      setEmpleadoDni(
        solicitud.empleadoReemplazoDni || ''
      )
      setObservacion('')
      setErrorLocal('')
    }
  }, [visible, solicitud])

  if (!visible || !solicitud) return null

  const esAprobacion = accion === 'aprobar'

  // Valida que se haya seleccionado un empleado de reemplazo antes de aprobar
  const handleConfirmar = () => {
    setErrorLocal('')

    if (esAprobacion && !empleadoDni) {
      setErrorLocal(
        'Debés seleccionar un empleado propuesto para aprobar la solicitud.'
      )
      return
    }

    onConfirmar({
      empleadoPropuestoDni: empleadoDni || null,
      observacion: observacion.trim() || null,
    })
  }

  // Filtra la lista de personal para requerir el mismo rol que la guardia y excluir al solicitante
  const filtrarEmpleados = (listEmpleados) => {
    return listEmpleados.filter((emp) => {
      return (
        String(emp.dni) !== String(solicitud.empleadoDni) &&
        emp.rol === solicitud.infoGuardia?.rol
      )
    })
  }

  // Cierra con Escape si no hay una operación en curso
  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && !procesando) {
      onCancelar()
    }
  }

  // Cierra al hacer clic en el fondo oscuro
  const handleOverlayClick = (event) => {
    if (
      event.target === event.currentTarget &&
      !procesando
    ) {
      onCancelar()
    }
  }

  const tituloAccion = esAprobacion
    ? 'Aprobar Solicitud'
    : 'Rechazar Solicitud'

  const textoBoton = procesando
    ? 'Procesando…'
    : esAprobacion
      ? 'Aprobar'
      : 'Rechazar'

  return (
    <div
      className="common-modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label={tituloAccion}
    >
      <div className="common-modal-dialogo admin-modal-resolucion">
        <h3 className="common-modal-titulo">
          {tituloAccion}
        </h3>

        <p className="common-modal-mensaje">
          Solicitud de{' '}
          <strong>
            {solicitud.nombreEmpleado}
          </strong>
          {solicitud.infoGuardia && (
            <>
              {' '}para la guardia del{' '}
              <strong>
                {solicitud.infoGuardia.fecha}
              </strong>
            </>
          )}
        </p>

        {/* ── Error local del modal ── */}
        {errorLocal && (
          <p className="admin-modal-error">
            {errorLocal}
          </p>
        )}

        {/* ── Empleado propuesto ── */}
        <div className="admin-modal-campo">
          <label
            className="admin-label-form"
            htmlFor="modal-empleado-propuesto"
          >
            Empleado Propuesto
            {esAprobacion
              ? ' (obligatorio)'
              : ''}
          </label>

          <select
            id="modal-empleado-propuesto"
            className="admin-input-estilo"
            value={empleadoDni}
            onChange={(event) =>
              setEmpleadoDni(event.target.value)
            }
            disabled={!esAprobacion || procesando}
          >
            <option value="">
              Seleccione un empleado
            </option>

            {filtrarEmpleados(empleados).map((emp) => (
              <option
                key={emp.dni}
                value={emp.dni}
              >
                {emp.nombre} {emp.apellido} — {emp.rol}
              </option>
            ))}
          </select>
        </div>

        {/* ── Observación ── */}
        <div className="admin-modal-campo">
          <label
            className="admin-label-form"
            htmlFor="modal-observacion"
          >
            Observación (opcional)
          </label>

          <textarea
            id="modal-observacion"
            className="admin-input-estilo admin-area-texto"
            placeholder="Escribí una observación para el empleado..."
            value={observacion}
            onChange={(event) =>
              setObservacion(event.target.value)
            }
            disabled={procesando}
          />
        </div>

        {/* ── Acciones ── */}
        <div className="common-modal-acciones">
          <button
            type="button"
            className="common-modal-btn common-modal-btn-cancelar"
            onClick={onCancelar}
            disabled={procesando}
          >
            Cancelar
          </button>

          <button
            type="button"
            className={
              esAprobacion
                ? 'common-modal-btn admin-modal-btn-aprobar'
                : 'common-modal-btn common-modal-btn-confirmar'
            }
            onClick={handleConfirmar}
            disabled={procesando}
          >
            {textoBoton}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalResolucionSolicitud
