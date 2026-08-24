package com.jpbravo.guardia_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Manejador global de excepciones de validación para guardia-service.
 *
 * <p>Captura errores de Jakarta Validation ({@link MethodArgumentNotValidException})
 * y devuelve un JSON estructurado para que el frontend muestre errores inline:</p>
 *
 * <pre>
 * {
 *   "errores": {
 *     "fecha": "La fecha es obligatoria",
 *     "horaFin": "La hora de fin es obligatoria"
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
}
