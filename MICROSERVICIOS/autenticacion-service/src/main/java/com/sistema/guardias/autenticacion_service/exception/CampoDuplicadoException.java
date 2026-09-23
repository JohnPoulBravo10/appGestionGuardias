package com.sistema.guardias.autenticacion_service.exception;

/* Excepción lanzada cuando se intenta registrar un valor que ya existe
   en un campo que debe ser único (ej: usuario, DNI).
   Contiene el nombre del campo afectado para que el manejador
   pueda devolver un error estructurado al frontend. */
public class CampoDuplicadoException extends RuntimeException {

    private final String campo;

    // Constructor con campo duplicado y mensaje descriptivo de error
    public CampoDuplicadoException(String campo, String mensaje) {
        super(mensaje);
        this.campo = campo;
    }

    public String getCampo() {
        return campo;
    }
}
