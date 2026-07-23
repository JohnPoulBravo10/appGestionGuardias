import { useState } from 'react'

function SolicitarCambio() {
  const [guardiaSeleccionada, setGuardiaSeleccionada] =
    useState('')

  const [companeroPropuesto, setCompaneroPropuesto] =
    useState('')

  const [motivo, setMotivo] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    console.log({
      guardiaSeleccionada,
      companeroPropuesto,
      motivo,
    })
  }

  return (
    <form
      className="div_solicitar_cambio"
      onSubmit={handleSubmit}
    >
      <h2 className="titulo-formulario">
        Solicitar Cambio de Guardia
      </h2>

      <label
        className="label-form"
        htmlFor="guardia-cambiar"
      >
        Seleccionar Guardia a Cambiar
      </label>

      <select
        id="guardia-cambiar"
        className="input-estilo"
        value={guardiaSeleccionada}
        onChange={(event) =>
          setGuardiaSeleccionada(event.target.value)
        }
        required
      >
        <option value="">
          Seleccione una guardia
        </option>

        <option value="guardia-temporal">
          Mañana, 28/05/2026 (08:00 - 16:00) - UTI
        </option>
      </select>

      <label
        className="label-form"
        htmlFor="companero-propuesto"
      >
        Compañero Propuesto (Opcional)
      </label>

      <select
        id="companero-propuesto"
        className="input-estilo"
        value={companeroPropuesto}
        onChange={(event) =>
          setCompaneroPropuesto(event.target.value)
        }
      >
        <option value="">
          Seleccione un compañero (opcional)
        </option>
      </select>

      <p className="texto-ayuda">
        Si no proponés a nadie, la solicitud quedará
        abierta para que otro empleado o administrador
        la asigne.
      </p>

      <label
        className="label-form"
        htmlFor="motivo-cambio"
      >
        Motivo del Cambio
      </label>

      <textarea
        id="motivo-cambio"
        className="input-estilo area-texto"
        placeholder="Escribí brevemente el motivo de tu solicitud..."
        value={motivo}
        onChange={(event) =>
          setMotivo(event.target.value)
        }
        required
      />

      <div className="contenedor-boton">
        <button
          type="submit"
          className="btn-enviar"
        >
          ✈️ Enviar Solicitud
        </button>
      </div>
    </form>
  )
}

export default SolicitarCambio