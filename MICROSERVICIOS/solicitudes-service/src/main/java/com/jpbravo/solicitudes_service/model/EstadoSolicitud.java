package com.jpbravo.solicitudes_service.model;

/**
 * Estados posibles de una solicitud de cambio de guardia.
 * La transición válida es: PENDIENTE → APROBADA o PENDIENTE → RECHAZADA.
 * Una vez resuelta, el estado es final e inmutable.
 */
public enum EstadoSolicitud {
    PENDIENTE,
    APROBADA,
    RECHAZADA
}
