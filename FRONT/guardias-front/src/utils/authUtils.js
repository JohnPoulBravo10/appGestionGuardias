/**
 * Decodifica el payload de un JWT.
 *
 * Importante:
 * esto solamente sirve para leer los datos del token en el frontend.
 * La validación real del token siempre la realiza el backend.
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
 * Obtiene el token almacenado durante el login.
 */
export function getToken() {
  return localStorage.getItem('token')
}

/**
 * Obtiene los datos del usuario autenticado.
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
 * Intenta obtener el identificador del empleado desde el JWT.
 *
 * Se contemplan distintos nombres posibles porque depende de cómo
 * esté construido el token en autenticacion-service.
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
 * Obtiene el rol principal del usuario.
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
 * Elimina la sesión actual.
 */
export function cerrarSesion() {
  localStorage.removeItem('token')
}