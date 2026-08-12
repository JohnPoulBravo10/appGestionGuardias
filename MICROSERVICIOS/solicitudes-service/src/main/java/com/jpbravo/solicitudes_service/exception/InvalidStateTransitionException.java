package com.jpbravo.solicitudes_service.exception;

import com.jpbravo.solicitudes_service.model.EstadoSolicitud;

/**
 * Excepción lanzada cuando se intenta realizar una transición de estado
 * no permitida (por ejemplo, aprobar una solicitud ya rechazada).
 * Solo se permite: PENDIENTE → APROBADA o PENDIENTE → RECHAZADA.
 */
public class InvalidStateTransitionException extends RuntimeException {

    public InvalidStateTransitionException(EstadoSolicitud estadoActual, EstadoSolicitud estadoDeseado) {
        super(String.format(
                "Transición de estado no permitida: no se puede cambiar de %s a %s. "
                        + "Solo las solicitudes en estado PENDIENTE pueden ser resueltas.",
                estadoActual, estadoDeseado));
    }
}
