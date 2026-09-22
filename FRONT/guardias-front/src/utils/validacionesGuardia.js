/**
 * Módulo de validaciones para formularios de guardias.
 * Cada función retorna `null` si el campo es válido o un mensaje de error (`string` u `objeto`).
 */

// Roles y áreas operativas permitidas
const ROLES_VALIDOS = [
  'ENFERMERIA',
  'LIMPIEZA',
  'MANTENIMIENTO',
]

// Límites de duración permitidos por guardia
const DURACION_MIN_HORAS = 4
const DURACION_MAX_HORAS = 12

export { ROLES_VALIDOS }

/**
 * Retorna la fecha actual en formato local "YYYY-MM-DD".
 */
function obtenerFechaHoy() {
  const ahora = new Date()
  const anio = ahora.getFullYear()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

/**
 * Determina si una hora (formato "HH:mm") corresponde a la tarde/noche (>= 12:00).
 */
function esHorarioPM(hora) {
  const [horas] = hora.split(':').map(Number)
  return horas >= 12
}

/**
 * Determina si una hora (formato "HH:mm") corresponde a la mañana (< 12:00).
 */
function esHorarioAM(hora) {
  return !esHorarioPM(hora)
}

/**
 * Retorna la hora actual en formato local "HH:mm".
 */
function obtenerHoraActual() {
  const ahora = new Date()
  const horas = String(ahora.getHours()).padStart(2, '0')
  const minutos = String(ahora.getMinutes()).padStart(2, '0')
  return `${horas}:${minutos}`
}

/**
 * Calcula la duración en horas entre dos horarios ("HH:mm").
 * Contempla guardias nocturnas que finalizan al día siguiente.
 */
function calcularDuracionHoras(horaInicio, horaFin) {
  const [hInicio, mInicio] = horaInicio.split(':').map(Number)
  const [hFin, mFin] = horaFin.split(':').map(Number)

  const minutosInicio = hInicio * 60 + mInicio
  const minutosFin = hFin * 60 + mFin

  // Si fin < inicio, la guardia cruza la medianoche (se suman los minutos restantes del día)
  const duracionMinutos = minutosFin >= minutosInicio
    ? minutosFin - minutosInicio
    : (24 * 60 - minutosInicio) + minutosFin

  return duracionMinutos / 60
}

/**
 * Valida que la fecha sea obligatoria y no anterior al día de hoy.
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
 * Valida que la hora de inicio sea obligatoria.
 */
export function validarHoraInicio(horaInicio) {
  const valor = (horaInicio ?? '').trim()

  if (valor.length === 0) {
    return 'La hora de inicio es obligatoria'
  }

  return null
}

/**
 * Valida que la hora de fin sea obligatoria.
 */
export function validarHoraFin(horaFin) {
  const valor = (horaFin ?? '').trim()

  if (valor.length === 0) {
    return 'La hora de fin es obligatoria'
  }

  return null
}

/**
 * Valida la coherencia horaria: no igualdad, orden cronológico (excepto turno noche) y duración permitida (4-12h).
 *
 * @param {string} horaInicio - "HH:mm"
 * @param {string} horaFin - "HH:mm"
 * @returns {{ horaFin: string } | null} Error asignado al campo horaFin o null si es válido
 */
export function validarHorario(horaInicio, horaFin) {
  const inicio = (horaInicio ?? '').trim()
  const fin = (horaFin ?? '').trim()

  if (inicio.length === 0 || fin.length === 0) {
    return null
  }

  if (inicio === fin) {
    return {
      horaFin:
        'La hora de inicio y fin no pueden ser iguales',
    }
  }

  // Turno noche: inicio en PM y fin en AM se interpreta como turno que cruza la medianoche
  const esGuardiaNocturna =
    esHorarioPM(inicio) && esHorarioAM(fin)

  if (!esGuardiaNocturna && inicio > fin) {
    return {
      horaFin:
        'La hora de fin debe ser posterior a la de inicio',
    }
  }

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
 * Para guardias programadas para hoy, valida que la hora de inicio sea posterior a la hora actual.
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
 * Valida que el área de trabajo (rol) sea requerida y pertenezca a los roles válidos.
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

/**
 * Valida la totalidad de campos de una guardia y sus reglas cruzadas.
 *
 * @param {Object} guardia - Datos de la guardia { fecha, horaInicio, horaFin, rol }
 * @returns {Object|null} Mapa de errores `{ campo: mensaje }` o `null` si no hay errores
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

  // Si la fecha y hora de inicio son válidas individualmente, verificar que no sea una hora pasada de hoy
  if (!errores.fecha && !errores.horaInicio) {
    const erroresHoraHoy = validarHoraInicioHoy(
      guardia.fecha,
      guardia.horaInicio
    )

    if (erroresHoraHoy) {
      Object.assign(errores, erroresHoraHoy)
    }
  }

  // Si inicio y fin son válidos individualmente, verificar coherencia de rango y duración
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
