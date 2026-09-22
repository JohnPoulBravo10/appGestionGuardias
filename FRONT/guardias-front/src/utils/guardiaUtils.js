/**
 * Utilidades para cálculo de estados, formateo y validación de disponibilidad de guardias.
 */

/**
 * Calcula el estado operativo de una guardia ('SIN ASIGNAR', 'SIN DATOS', 'PROXIMA', 'EN CURSO', 'TERMINADA').
 * Soporta guardias nocturnas que finalizan al día siguiente.
 *
 * @param {Object} guardia - Objeto con datos de la guardia ({ empleadoId, fecha, horaInicio, horaFin })
 * @param {Date} [fechaActual=new Date()] - Fecha/hora de referencia para evaluar el estado
 * @returns {string} Estado computado de la guardia
 */
export function calcularEstadoGuardia(
  guardia,
  fechaActual = new Date()
) {
  const sinEmpleado =
    guardia.empleadoId === null ||
    guardia.empleadoId === undefined ||
    guardia.empleadoId === ''

  if (sinEmpleado) {
    return 'SIN ASIGNAR'
  }

  if (
    !guardia.fecha ||
    !guardia.horaInicio ||
    !guardia.horaFin
  ) {
    return 'SIN DATOS'
  }

  const fechaHoraInicio = new Date(
    `${guardia.fecha}T${guardia.horaInicio}`
  )

  const fechaHoraFin = new Date(
    `${guardia.fecha}T${guardia.horaFin}`
  )

  if (
    Number.isNaN(fechaHoraInicio.getTime()) ||
    Number.isNaN(fechaHoraFin.getTime())
  ) {
    return 'SIN DATOS'
  }

  // Si la hora de fin es menor o igual al inicio, la guardia cruza la medianoche (termina al día siguiente)
  if (fechaHoraFin <= fechaHoraInicio) {
    fechaHoraFin.setDate(
      fechaHoraFin.getDate() + 1
    )
  }

  if (fechaActual >= fechaHoraFin) {
    return 'TERMINADA'
  }

  if (
    fechaActual >= fechaHoraInicio &&
    fechaActual < fechaHoraFin
  ) {
    return 'EN CURSO'
  }

  return 'PROXIMA'
}

/**
 * Retorna el texto legible para mostrar al usuario según el estado de la guardia.
 */
export function formatearEstadoGuardia(
  estado
) {
  const textos = {
    PROXIMA: 'PRÓXIMA',
    'EN CURSO': 'EN CURSO',
    TERMINADA: 'TERMINADA',
    'SIN ASIGNAR': 'SIN ASIGNAR',
    'SIN DATOS': 'SIN DATOS',
  }

  return textos[estado] || estado
}

/**
 * Convierte el estado en una clase CSS válida (minúsculas, sin acentos y separada por guiones).
 */
export function obtenerClaseEstadoGuardia(
  estado
) {
  return String(estado)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll(' ', '-')
}

/**
 * Determina si dos rangos horarios en la misma fecha se solapan.
 * Utiliza intervalos semiabiertos [inicio, fin): dos guardias consecutivas no generan conflicto.
 *
 * @param {string} fecha1 - Fecha de la primera guardia (YYYY-MM-DD)
 * @param {string} inicio1 - Hora de inicio (HH:mm)
 * @param {string} fin1 - Hora de fin (HH:mm)
 * @param {string} fecha2 - Fecha de la segunda guardia (YYYY-MM-DD)
 * @param {string} inicio2 - Hora de inicio (HH:mm)
 * @param {string} fin2 - Hora de fin (HH:mm)
 * @returns {boolean} true si existe solapamiento
 */
export function tienenSolapamientoHorario(
  fecha1,
  inicio1,
  fin1,
  fecha2,
  inicio2,
  fin2
) {
  if (fecha1 !== fecha2) {
    return false
  }

  // Dos rangos [A, B) y [C, D) se solapan si A < D y C < B (comparación lexicográfica válida para HH:mm)
  return inicio1 < fin2 && inicio2 < fin1
}

/**
 * Filtra la lista de empleados excluyendo aquellos con guardias solapadas en el horario indicado.
 *
 * @param {Array} empleados - Candidatos a asignar (deben poseer propiedad `dni`)
 * @param {Array} guardiasExistentes - Lista completa de guardias registradas
 * @param {Object} datosGuardia - Horario objetivo { fecha, horaInicio, horaFin }
 * @param {number|null} [guardiaIdExcluir=null] - ID de la guardia en edición a omitir en la comprobación
 * @returns {Array} Empleados con disponibilidad horaria
 */
export function filtrarEmpleadosDisponibles(
  empleados,
  guardiasExistentes,
  datosGuardia,
  guardiaIdExcluir = null
) {
  const { fecha, horaInicio, horaFin } =
    datosGuardia

  if (!fecha || !horaInicio || !horaFin) {
    return empleados
  }

  // Identificadores de empleados con conflicto de horario
  const empleadosOcupados = new Set()

  for (const guardia of guardiasExistentes) {
    // Se ignora la propia guardia si estamos editando
    if (
      guardiaIdExcluir !== null &&
      guardia.id === guardiaIdExcluir
    ) {
      continue
    }

    if (
      guardia.empleadoId === null ||
      guardia.empleadoId === undefined
    ) {
      continue
    }

    if (
      tienenSolapamientoHorario(
        fecha,
        horaInicio,
        horaFin,
        guardia.fecha,
        guardia.horaInicio,
        guardia.horaFin
      )
    ) {
      empleadosOcupados.add(
        guardia.empleadoId
      )
    }
  }

  return empleados.filter(
    (empleado) =>
      !empleadosOcupados.has(empleado.dni)
  )
}