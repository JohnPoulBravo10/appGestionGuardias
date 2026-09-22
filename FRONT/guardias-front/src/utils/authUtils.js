/**
 * Utilidades de autenticación y manejo de tokens JWT en el cliente.
 * Nota: La validación criptográfica real del token la realiza el backend.
 */

/**
 * Decodifica y parsea el payload de un token JWT (base64url).
 * Retorna el objeto JSON del payload o null si el token es inválido.
 */
export function decodeJwtPayload(token) {
  if (!token) {
    return null
  }

  try {
    const partes = token.split('.')

    if (partes.length !== 3) {
      return null
    }

    // Normalización de base64url a base64 estándar con padding adecuado
    const payloadBase64 = partes[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const padding =
      '='.repeat((4 - (payloadBase64.length % 4)) % 4)

    const payloadJson = atob(payloadBase64 + padding)

    return JSON.parse(payloadJson)
  } catch (error) {
    console.error('No se pudo decodificar el JWT:', error)
    return null
  }
}

/**
 * Obtiene el token JWT almacenado en localStorage.
 */
export function getToken() {
  return localStorage.getItem('token')
}

/**
 * Retorna los claims/datos del usuario autenticado decodificando el token actual.
 */
export function getUsuarioAutenticado() {
  const token = getToken()

  if (!token) {
    return null
  }

  const payload = decodeJwtPayload(token)

  if (!payload) {
    return null
  }

  return payload
}

/**
 * Extrae el identificador o DNI del empleado desde el JWT.
 * Contempla múltiples nombres de claim por compatibilidad con el backend.
 */
export function getEmpleadoIdFromToken() {
  const payload = getUsuarioAutenticado()

  if (!payload) {
    return null
  }

  const empleadoId =
    payload.empleadoDni ??
    payload.empleadoId ??
    payload.dni ??
    payload.idEmpleado

  if (empleadoId === undefined || empleadoId === null) {
    return null
  }

  return empleadoId
}

/**
 * Extrae el rol principal del usuario, normalizando strings o listas de authorities.
 * Elimina el prefijo 'ROLE_' si estuviera presente.
 */
export function getRolFromToken() {
  const payload = getUsuarioAutenticado()

  if (!payload) {
    return null
  }

  const roles =
    payload.roles ??
    payload.authorities ??
    []

  if (!Array.isArray(roles) || roles.length === 0) {
    return null
  }

  const primerRol = roles[0]

  const authority =
    typeof primerRol === 'string'
      ? primerRol
      : primerRol.authority

  return authority?.replace(/^ROLE_/, '') ?? null
}

/**
 * Elimina la sesión activa limpiando el token del almacenamiento local.
 */
export function cerrarSesion() {
  localStorage.removeItem('token')
}