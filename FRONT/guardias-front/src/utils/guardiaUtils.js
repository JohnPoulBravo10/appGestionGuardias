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