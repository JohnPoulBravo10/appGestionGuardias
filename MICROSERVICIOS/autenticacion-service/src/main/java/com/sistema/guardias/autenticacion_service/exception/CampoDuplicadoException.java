package com.sistema.guardias.autenticacion_service.exception;

/**
 * Excepción lanzada cuando se intenta registrar un valor que ya existe
 * en un campo que debe ser único (ej: usuario, DNI).
 *
 * Contiene el nombre del campo afectado para que el
 * {@link ValidationExceptionHandler} pueda devolver un error
 * estructurado al frontend.
 */
public class CampoDuplicadoException extends RuntimeException {

    private final String campo;

    /**
     * @param campo   nombre del campo duplicado (ej: "usuario", "dni")
     * @param mensaje descripción legible del error
     */
    public CampoDuplicadoException(String campo, String mensaje) {
        super(mensaje);
        this.campo = campo;
    }

    public String getCampo() {
        return campo;
    }
}
