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
 * Compara con límites abiertos: dos guardias consecutivas
 * (fin de una = inicio de otra) NO se consideran solapadas.
 *
 * @param {string} fecha1 - Fecha de la primera guardia (YYYY-MM-DD)
 * @param {string} inicio1 - Hora de inicio de la primera guardia (HH:mm)
 * @param {string} fin1 - Hora de fin de la primera guardia (HH:mm)
 * @param {string} fecha2 - Fecha de la segunda guardia (YYYY-MM-DD)
 * @param {string} inicio2 - Hora de inicio de la segunda guardia (HH:mm)
 * @param {string} fin2 - Hora de fin de la segunda guardia (HH:mm)
 * @returns {boolean} true si los rangos se solapan
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

  /*
   * Dos rangos [A, B) y [C, D) se solapan si A < D && C < B.
   * Se compara como string ya que el formato HH:mm es lexicográficamente ordenable.
   */
  return inicio1 < fin2 && inicio2 < fin1
}

/**
 * Filtra una lista de empleados excluyendo aquellos que ya tienen
 * una guardia asignada que se solapa con la guardia en creación/edición.
 *
 * @param {Array} empleados - Lista de empleados candidatos (con propiedad `dni`)
 * @param {Array} guardiasExistentes - Todas las guardias del sistema
 * @param {Object} datosGuardia - Datos de la guardia actual { fecha, horaInicio, horaFin }
 * @param {number|null} [guardiaIdExcluir=null] - ID de la guardia que se está editando
 *   (se excluye de la comparación para que el empleado asignado actual siga disponible)
 * @returns {Array} empleados que no tienen conflicto horario
 */
export function filtrarEmpleadosDisponibles(
  empleados,
  guardiasExistentes,
  datosGuardia,
  guardiaIdExcluir = null
) {
  const { fecha, horaInicio, horaFin } =
    datosGuardia

  /* Si faltan datos de horario, no se puede filtrar; mostrar todos */
  if (!fecha || !horaInicio || !horaFin) {
    return empleados
  }

  /**
   * Conjunto de IDs de empleados que ya tienen una guardia
   * solapada con el rango horario de la guardia actual.
   */
  const empleadosOcupados = new Set()

  for (const guardia of guardiasExistentes) {
    /* Excluir la guardia que se está editando */
    if (
      guardiaIdExcluir !== null &&
      guardia.id === guardiaIdExcluir
    ) {
      continue
    }

    /* Solo considerar guardias con empleado asignado */
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