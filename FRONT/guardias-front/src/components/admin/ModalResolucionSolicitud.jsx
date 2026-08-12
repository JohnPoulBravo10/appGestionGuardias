import { useState, useEffect } from 'react'

/**
 * Modal de resolución de solicitudes de cambio de guardia.
 *
 * Permite al administrador:
 * - Modificar o asignar el empleado propuesto (obligatorio al aprobar).
 * - Añadir una observación de texto (siempre opcional).
 * - Confirmar la acción (aprobar / rechazar).
 *
 * Reutiliza los estilos `common-modal-*` del sistema de diseño compartido,
 * extendidos con clases `admin-modal-*` para los campos de formulario.
 */
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

  /*
   * Al abrirse el modal, pre-seleccionamos el empleado
   * propuesto original si existe.
   */
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

  /**
   * Valida y envía la resolución.
   * Al aprobar, el empleado propuesto es obligatorio.
   */
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

  /**
   * Cierra el modal con Escape.
   */
  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && !procesando) {
      onCancelar()
    }
  }

  /**
   * Cierra el modal al hacer click en el overlay.
   */
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
              : ' (opcional)'}
          </label>

          <select
            id="modal-empleado-propuesto"
            className="admin-input-estilo"
            value={empleadoDni}
            onChange={(event) =>
              setEmpleadoDni(event.target.value)
            }
            disabled={procesando}
          >
            <option value="">
              Seleccione un empleado
            </option>

            {empleados.map((emp) => (
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
