package com.sistema.guardias.autenticacion_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Manejador global de excepciones de validación.
 *
 * Captura errores de Jakarta Validation ({@link MethodArgumentNotValidException})
 * y excepciones de negocio ({@link CampoDuplicadoException}), devolviendo
 * un JSON estructurado para que el frontend muestre errores inline:
 *
 * <pre>
 * {
 *   "errores": {
 *     "usuario": "El usuario ya existe",
 *     "password": "Entre 6 y 30 caracteres"
 *   }
 * }
 * </pre>
 */
@RestControllerAdvice
public class ValidationExceptionHandler {

    /**
     * Maneja errores de validación Jakarta (anotaciones @Valid).
     * Extrae cada campo con error y su mensaje, devolviendo HTTP 400.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidacion(
            MethodArgumentNotValidException ex) {

        Map<String, String> erroresCampo = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error -> erroresCampo.put(
                        error.getField(),
                        error.getDefaultMessage()));

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("errores", erroresCampo);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(respuesta);
    }

    /**
     * Maneja errores de unicidad (usuario o DNI duplicado).
     * Devuelve HTTP 409 Conflict con el campo afectado.
     */
    @ExceptionHandler(CampoDuplicadoException.class)
    public ResponseEntity<Map<String, Object>> manejarDuplicado(
            CampoDuplicadoException ex) {

        Map<String, String> erroresCampo = new HashMap<>();
        erroresCampo.put(ex.getCampo(), ex.getMessage());

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("errores", erroresCampo);

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(respuesta);
    }
}
