package com.jpbravo.solicitudes_service.exception;

/**
 * Excepción lanzada cuando falla la comunicación con el guardia-service
 * durante la resolución de una solicitud.
 * Se traduce a HTTP 502 Bad Gateway en el {@link GlobalExceptionHandler}.
 */
public class GuardiaCommunicationException extends RuntimeException {

    public GuardiaCommunicationException(Long guardiaId, Throwable cause) {
        super(String.format(
                "Error al comunicarse con el servicio de guardias para la guardia %d. "
                        + "La solicitud no fue procesada. Intente nuevamente.",
                guardiaId), cause);
    }
}
