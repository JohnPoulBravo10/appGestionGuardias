/**
 * Módulo de validaciones para los formularios de guardias.
 *
 * Cada función recibe el valor del campo y retorna:
 * - null   → el campo es válido
 * - string → mensaje de error a mostrar debajo del input
 *
 * Se mantiene la misma convención que validacionesEmpleado.js
 * para que ambos formularios compartan la misma UX.
 */

// ── Constantes ─────────────────────────────────────────────────

/** Roles válidos para una guardia */
const ROLES_VALIDOS = [
  'ENFERMERIA',
  'LIMPIEZA',
  'MANTENIMIENTO',
]

/** Duración mínima de una guardia en horas */
const DURACION_MIN_HORAS = 4

/** Duración máxima de una guardia en horas */
const DURACION_MAX_HORAS = 12

export { ROLES_VALIDOS }

// ── Helpers ────────────────────────────────────────────────────

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD
 * usando la zona horaria local del navegador.
 */
function obtenerFechaHoy() {
  const ahora = new Date()
  const anio = ahora.getFullYear()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

/**
 * Determina si un horario es PM (>= 12:00).
 * Recibe un string en formato "HH:mm".
 */
function esHorarioPM(hora) {
  const [horas] = hora.split(':').map(Number)
  return horas >= 12
}

/**
 * Determina si un horario es AM (< 12:00).
 * Recibe un string en formato "HH:mm".
 */
function esHorarioAM(hora) {
  return !esHorarioPM(hora)
}

/**
 * Obtiene la hora actual en formato "HH:mm"
 * usando la zona horaria local del navegador.
 */
function obtenerHoraActual() {
  const ahora = new Date()
  const horas = String(ahora.getHours()).padStart(2, '0')
  const minutos = String(ahora.getMinutes()).padStart(2, '0')
  return `${horas}:${minutos}`
}

/**
 * Calcula la duración en horas entre dos horarios.
 * Soporta guardias nocturnas (que cruzan la medianoche).
 *
 * @param {string} horaInicio - formato "HH:mm"
 * @param {string} horaFin    - formato "HH:mm"
 * @returns {number} duración en horas (decimal)
 */
function calcularDuracionHoras(horaInicio, horaFin) {
  const [hInicio, mInicio] = horaInicio.split(':').map(Number)
  const [hFin, mFin] = horaFin.split(':').map(Number)

  const minutosInicio = hInicio * 60 + mInicio
  const minutosFin = hFin * 60 + mFin

  /* Si fin < inicio, la guardia cruza la medianoche */
  const duracionMinutos = minutosFin >= minutosInicio
    ? minutosFin - minutosInicio
    : (24 * 60 - minutosInicio) + minutosFin

  return duracionMinutos / 60
}

// ── Validaciones individuales ──────────────────────────────────

/**
 * Valida el campo "fecha".
 * Reglas: obligatorio, no puede ser anterior a hoy.
 */
export function validarFecha(fecha) {
  const valor = (fecha ?? '').trim()

  if (valor.length === 0) {
    return 'La fecha es obligatoria'
  }

  const hoy = obtenerFechaHoy()

  if (valor < hoy) {
    return 'La fecha no puede ser anterior a hoy'
  }

  return null
}

/**
 * Valida el campo "horaInicio".
 * Reglas: obligatorio.
 */
export function validarHoraInicio(horaInicio) {
  const valor = (horaInicio ?? '').trim()

  if (valor.length === 0) {
    return 'La hora de inicio es obligatoria'
  }

  return null
}

/**
 * Valida el campo "horaFin".
 * Reglas: obligatorio.
 */
export function validarHoraFin(horaFin) {
  const valor = (horaFin ?? '').trim()

  if (valor.length === 0) {
    return 'La hora de fin es obligatoria'
  }

  return null
}

/**
 * Valida la coherencia entre hora de inicio y hora de fin.
 *
 * Reglas:
 * - No pueden ser iguales.
 * - El inicio debe ser anterior al fin, salvo guardias nocturnas
 *   (inicio PM y fin AM → se asume que cruza la medianoche).
 *
 * @returns {{ horaFin: string } | null} Error asociado a horaFin o null
 */
export function validarHorario(horaInicio, horaFin) {
  const inicio = (horaInicio ?? '').trim()
  const fin = (horaFin ?? '').trim()

  /* Si alguno está vacío, se captura en las validaciones individuales */
  if (inicio.length === 0 || fin.length === 0) {
    return null
  }

  if (inicio === fin) {
    return {
      horaFin:
        'La hora de inicio y fin no pueden ser iguales',
    }
  }

  /*
   * Guardia nocturna: si inicio es PM y fin es AM,
   * se asume que la guardia cruza la medianoche → es válido.
   */
  const esGuardiaNocturna =
    esHorarioPM(inicio) && esHorarioAM(fin)

  if (!esGuardiaNocturna && inicio > fin) {
    return {
      horaFin:
        'La hora de fin debe ser posterior a la de inicio',
    }
  }

  /* Validación de duración mínima y máxima */
  const duracion = calcularDuracionHoras(inicio, fin)

  if (duracion < DURACION_MIN_HORAS) {
    return {
      horaFin:
        `La guardia debe durar al menos ${DURACION_MIN_HORAS} horas`,
    }
  }

  if (duracion > DURACION_MAX_HORAS) {
    return {
      horaFin:
        `La guardia no puede durar más de ${DURACION_MAX_HORAS} horas`,
    }
  }

  return null
}

/**
 * Valida que, si la fecha es hoy, la hora de inicio
 * sea posterior a la hora actual.
 *
 * @param {string} fecha      - formato "YYYY-MM-DD"
 * @param {string} horaInicio - formato "HH:mm"
 * @returns {{ horaInicio: string } | null}
 */
export function validarHoraInicioHoy(fecha, horaInicio) {
  const fechaValor = (fecha ?? '').trim()
  const horaValor = (horaInicio ?? '').trim()

  if (fechaValor.length === 0 || horaValor.length === 0) {
    return null
  }

  const hoy = obtenerFechaHoy()

  if (fechaValor === hoy && horaValor <= obtenerHoraActual()) {
    return {
      horaInicio:
        'Para guardias de hoy, la hora de inicio debe ser posterior a la hora actual',
    }
  }

  return null
}

/**
 * Valida el campo "rol" (área de trabajo).
 * Reglas: obligatorio, debe ser un rol válido.
 */
export function validarRol(rol) {
  const valor = (rol ?? '').trim()

  if (valor.length === 0) {
    return 'El área de trabajo es obligatoria'
  }

  if (!ROLES_VALIDOS.includes(valor)) {
    return 'El área seleccionada no es válida'
  }

  return null
}

// ── Validación completa ────────────────────────────────────────

/**
 * Ejecuta todas las validaciones sobre el objeto guardia.
 *
 * @param {object} guardia - Estado actual del formulario
 * @returns {object|null} Objeto { campo: mensajeError } o null si todo es válido
 */
export function validarGuardia(guardia) {
  const errores = {}

  const errorFecha = validarFecha(guardia.fecha)
  if (errorFecha) errores.fecha = errorFecha

  const errorHoraInicio = validarHoraInicio(
    guardia.horaInicio
  )
  if (errorHoraInicio)
    errores.horaInicio = errorHoraInicio

  const errorHoraFin = validarHoraFin(
    guardia.horaFin
  )
  if (errorHoraFin) errores.horaFin = errorHoraFin

  const errorRol = validarRol(guardia.rol)
  if (errorRol) errores.rol = errorRol

  /*
   * Validar que si la fecha es hoy, la hora de inicio sea futura.
   * Solo si la fecha y hora de inicio pasaron la validación individual.
   */
  if (!errores.fecha && !errores.horaInicio) {
    const erroresHoraHoy = validarHoraInicioHoy(
      guardia.fecha,
      guardia.horaInicio
    )

    if (erroresHoraHoy) {
      Object.assign(errores, erroresHoraHoy)
    }
  }

  /*
   * Validar coherencia de horario solo si ambos campos
   * individuales pasaron la validación (evitar errores duplicados).
   */
  if (!errores.horaInicio && !errores.horaFin) {
    const erroresHorario = validarHorario(
      guardia.horaInicio,
      guardia.horaFin
    )

    if (erroresHorario) {
      Object.assign(errores, erroresHorario)
    }
  }

  return Object.keys(errores).length > 0
    ? errores
    : null
}
