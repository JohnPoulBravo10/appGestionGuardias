package com.jpbravo.solicitudes_service.exception;

/**
 * Excepción lanzada cuando no se encuentra una solicitud
 * con el identificador proporcionado.
 */
public class SolicitudNotFoundException extends RuntimeException {

    public SolicitudNotFoundException(String id) {
        super("Solicitud no encontrada con id: " + id);
    }
}
