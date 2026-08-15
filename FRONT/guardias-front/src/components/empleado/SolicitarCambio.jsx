import { useLocation } from 'react-router-dom'

import useSolicitarCambio from '../../hooks/useSolicitarCambio'

/**
 * Formulario para que un empleado solicite un cambio de guardia.
 *
 * - El dropdown de guardias muestra las guardias próximas
 *   asignadas al empleado autenticado (estado PROXIMA, fecha ≥ hoy),
 *   excluyendo aquellas que ya tienen una solicitud pendiente.
 * - El dropdown de compañeros lista empleados del mismo rol,
 *   excluyendo al propio empleado.
 * - Al enviar, se crea una solicitud en el solicitudes-service.
 * - Si se navega desde "Mis Guardias" con un guardiaId en el state,
 *   esa guardia se pre-selecciona automáticamente.
 */
function SolicitarCambio() {
  const location = useLocation()

  /*
   * Leemos el guardiaId pasado como state de navegación
   * desde la pantalla "Mis Guardias" (o vacío si se accede directamente).
   */
  const guardiaIdDesdeNavegacion =
    location.state?.guardiaId || ''

  const {
    guardias,
    companeros,

    guardiaSeleccionada,
    setGuardiaSeleccionada,

    companeroPropuesto,
    setCompaneroPropuesto,

    motivo,
    setMotivo,

    enviarSolicitud,
    formatearOpcionGuardia,

    isLoading,
    enviando,
    error,
    exito,
  } = useSolicitarCambio({
    initialGuardiaId: guardiaIdDesdeNavegacion,
  })

  return (
    <form
      className="empleado-solicitar-cambio"
      onSubmit={enviarSolicitud}
    >
      <h2 className="empleado-titulo-formulario">
        Solicitar Cambio de Guardia
      </h2>

      {/* ── Mensajes de error y éxito ── */}
      {error && (
        <p className="empleado-mensaje-error">
          {error}
        </p>
      )}

      {exito && (
        <p className="empleado-mensaje-exito">
          {exito}
        </p>
      )}

      {/* ── Dropdown: Guardia a cambiar ── */}
      <label
        className="empleado-label-form"
        htmlFor="guardia-cambiar"
      >
        Seleccionar Guardia a Cambiar
      </label>

      <select
        id="guardia-cambiar"
        className="empleado-input-estilo"
        value={guardiaSeleccionada}
        onChange={(event) =>
          setGuardiaSeleccionada(event.target.value)
        }
        disabled={isLoading || enviando}
        required
      >
        <option value="">
          {isLoading
            ? 'Cargando guardias…'
            : guardias.length === 0
              ? 'No tenés guardias próximas'
              : 'Seleccione una guardia'}
        </option>

        {guardias.map((guardia) => (
          <option
            key={guardia.id}
            value={guardia.id}
          >
            {formatearOpcionGuardia(guardia)}
          </option>
        ))}
      </select>

      {/* ── Dropdown: Compañero propuesto ── */}
      <label
        className="empleado-label-form"
        htmlFor="companero-propuesto"
      >
        Compañero Propuesto (Opcional)
      </label>

      <select
        id="companero-propuesto"
        className="empleado-input-estilo"
        value={companeroPropuesto}
        onChange={(event) =>
          setCompaneroPropuesto(event.target.value)
        }
        disabled={isLoading || enviando}
      >
        <option value="">
          {isLoading
            ? 'Cargando compañeros…'
            : companeros.length === 0
              ? 'No hay compañeros disponibles'
              : 'Seleccione un compañero (opcional)'}
        </option>

        {companeros.map((companero) => (
          <option
            key={companero.dni}
            value={companero.dni}
          >
            {companero.nombre} {companero.apellido}
          </option>
        ))}
      </select>

      <p className="empleado-texto-ayuda">
        Si no proponés a nadie, la solicitud quedará
        abierta para que otro empleado o administrador
        la asigne.
      </p>

      {/* ── Textarea: Motivo del cambio ── */}
      <label
        className="empleado-label-form"
        htmlFor="motivo-cambio"
      >
        Motivo del Cambio
      </label>

      <textarea
        id="motivo-cambio"
        className="empleado-input-estilo empleado-area-texto"
        placeholder="Escribí brevemente el motivo de tu solicitud..."
        value={motivo}
        onChange={(event) =>
          setMotivo(event.target.value)
        }
        disabled={enviando}
        required
      />

      {/* ── Botón de envío ── */}
      <div className="empleado-contenedor-boton">
        <button
          type="submit"
          className="empleado-btn-enviar"
          disabled={isLoading || enviando}
        >
          {enviando
            ? '⏳ Enviando…'
            : '✈️ Enviar Solicitud'}
        </button>
      </div>
    </form>
  )
}

export default SolicitarCambio