/**
 * Módulo de validaciones para el formulario de empleados.
 * Cada función retorna `null` si el campo es válido o un `string` con el mensaje de error.
 */

// Límites de longitud para campos de empleado
const LIMITES = Object.freeze({
  USUARIO_MIN: 4,
  USUARIO_MAX: 20,
  PASSWORD_MIN: 6,
  PASSWORD_MAX: 30,
  NOMBRE_MIN: 2,
  NOMBRE_MAX: 50,
  APELLIDO_MIN: 2,
  APELLIDO_MAX: 50,
  DNI_MIN_DIGITOS: 7,
  DNI_MAX_DIGITOS: 8,
  EMAIL_MAX: 50,
  TELEFONO_MIN_DIGITOS: 7,
  TELEFONO_MAX_DIGITOS: 15,
  DIRECCION_MAX: 100,
})

export { LIMITES }

// Patrones regulares para validación de formato
const REGEX_SOLO_LETRAS = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/ // Letras con soporte para acentos, diéresis, ñ y espacios
const REGEX_USUARIO = /^[a-zA-Z0-9_]+$/ // Alfanumérico y guión bajo
const REGEX_AL_MENOS_UNA_LETRA = /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/
const REGEX_AL_MENOS_UN_NUMERO = /[0-9]/
const REGEX_SOLO_NUMEROS = /^\d+$/
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Valida el nombre de usuario (requerido, 4-20 caracteres alfanuméricos o guión bajo).
 */
export function validarUsuario(valor) {
  const valorLimpio = (valor ?? '').trim()

  if (valorLimpio.length === 0) {
    return 'El usuario es obligatorio'
  }

  if (
    valorLimpio.length < LIMITES.USUARIO_MIN ||
    valorLimpio.length > LIMITES.USUARIO_MAX
  ) {
    return `Entre ${LIMITES.USUARIO_MIN} y ${LIMITES.USUARIO_MAX} caracteres`
  }

  if (!REGEX_USUARIO.test(valorLimpio)) {
    return 'Solo letras, números y guión bajo (_)'
  }

  return null
}

/**
 * Valida la contraseña (requerida, 6-30 caracteres, al menos 1 letra y 1 número).
 */
export function validarPassword(valor) {
  const valorCrudo = valor ?? ''

  if (valorCrudo.length === 0) {
    return 'La contraseña es obligatoria'
  }

  if (
    valorCrudo.length < LIMITES.PASSWORD_MIN ||
    valorCrudo.length > LIMITES.PASSWORD_MAX
  ) {
    return `Entre ${LIMITES.PASSWORD_MIN} y ${LIMITES.PASSWORD_MAX} caracteres`
  }

  if (!REGEX_AL_MENOS_UNA_LETRA.test(valorCrudo)) {
    return 'Debe incluir al menos una letra'
  }

  if (!REGEX_AL_MENOS_UN_NUMERO.test(valorCrudo)) {
    return 'Debe incluir al menos un número'
  }

  return null
}

/**
 * Función base para validar nombre o apellido (requerido, 2-50 caracteres alfabéticos).
 */
function validarNombreGenerico(valor, etiqueta) {
  const valorLimpio = (valor ?? '').trim()

  if (valorLimpio.length === 0) {
    return `El ${etiqueta} es obligatorio`
  }

  if (
    valorLimpio.length < LIMITES.NOMBRE_MIN ||
    valorLimpio.length > LIMITES.NOMBRE_MAX
  ) {
    return `Entre ${LIMITES.NOMBRE_MIN} y ${LIMITES.NOMBRE_MAX} caracteres`
  }

  if (!REGEX_SOLO_LETRAS.test(valorLimpio)) {
    return 'Solo se permiten letras'
  }

  return null
}

/**
 * Valida el nombre del empleado.
 */
export function validarNombre(valor) {
  return validarNombreGenerico(valor, 'nombre')
}

/**
 * Valida el apellido del empleado.
 */
export function validarApellido(valor) {
  return validarNombreGenerico(valor, 'apellido')
}

/**
 * Valida el DNI según formato argentino (requerido, solo dígitos, 7 a 8 caracteres).
 */
export function validarDni(valor) {
  const valorLimpio = String(valor ?? '').trim()

  if (valorLimpio.length === 0) {
    return 'El DNI es obligatorio'
  }

  if (!REGEX_SOLO_NUMEROS.test(valorLimpio)) {
    return 'Solo números, sin puntos ni espacios'
  }

  if (
    valorLimpio.length < LIMITES.DNI_MIN_DIGITOS ||
    valorLimpio.length > LIMITES.DNI_MAX_DIGITOS
  ) {
    return `DNI argentino: entre ${LIMITES.DNI_MIN_DIGITOS} y ${LIMITES.DNI_MAX_DIGITOS} dígitos`
  }

  return null
}

/**
 * Valida el correo electrónico (requerido, formato email estándar, máx 50 caracteres).
 */
export function validarEmail(valor) {
  const valorLimpio = (valor ?? '').trim()

  if (valorLimpio.length === 0) {
    return 'El email es obligatorio'
  }

  if (valorLimpio.length > LIMITES.EMAIL_MAX) {
    return `Máximo ${LIMITES.EMAIL_MAX} caracteres`
  }

  if (!REGEX_EMAIL.test(valorLimpio)) {
    return 'Formato de email inválido'
  }

  return null
}

/**
 * Valida el número de teléfono (requerido, solo dígitos, 7 a 15 números).
 */
export function validarTelefono(valor) {
  const valorLimpio = String(valor ?? '').trim()

  if (valorLimpio.length === 0) {
    return 'El teléfono es obligatorio'
  }

  if (!REGEX_SOLO_NUMEROS.test(valorLimpio)) {
    return 'Solo números, sin espacios ni guiones'
  }

  if (
    valorLimpio.length < LIMITES.TELEFONO_MIN_DIGITOS ||
    valorLimpio.length > LIMITES.TELEFONO_MAX_DIGITOS
  ) {
    return `Entre ${LIMITES.TELEFONO_MIN_DIGITOS} y ${LIMITES.TELEFONO_MAX_DIGITOS} dígitos`
  }

  return null
}

/**
 * Valida la dirección postal (opcional, máximo 100 caracteres si se ingresa).
 */
export function validarDireccion(valor) {
  const valorLimpio = (valor ?? '').trim()

  if (valorLimpio.length === 0) {
    return null
  }

  if (valorLimpio.length > LIMITES.DIRECCION_MAX) {
    return `Máximo ${LIMITES.DIRECCION_MAX} caracteres`
  }

  return null
}

/**
 * Valida la totalidad de campos de un empleado.
 *
 * @param {Object} empleado - Datos del formulario
 * @param {boolean} esEdicion - Si es edición, se omiten las credenciales (usuario y contraseña)
 * @returns {Object|null} Mapa de errores por campo `{ campo: mensaje }` o `null` si no hay errores
 */
export function validarEmpleado(empleado, esEdicion) {
  const errores = {}

  if (!esEdicion) {
    const errorUsuario = validarUsuario(empleado.usuario)
    if (errorUsuario) errores.usuario = errorUsuario

    const errorPassword = validarPassword(empleado.password)
    if (errorPassword) errores.password = errorPassword
  }

  const errorNombre = validarNombre(empleado.nombre)
  if (errorNombre) errores.nombre = errorNombre

  const errorApellido = validarApellido(empleado.apellido)
  if (errorApellido) errores.apellido = errorApellido

  const errorDni = validarDni(empleado.dni)
  if (errorDni) errores.dni = errorDni

  const errorEmail = validarEmail(empleado.email)
  if (errorEmail) errores.email = errorEmail

  const errorTelefono = validarTelefono(empleado.telefono)
  if (errorTelefono) errores.telefono = errorTelefono

  const errorDireccion = validarDireccion(empleado.direccion)
  if (errorDireccion) errores.direccion = errorDireccion

  return Object.keys(errores).length > 0
    ? errores
    : null
}
