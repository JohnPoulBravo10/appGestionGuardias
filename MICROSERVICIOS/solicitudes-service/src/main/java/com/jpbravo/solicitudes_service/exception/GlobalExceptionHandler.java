package com.jpbravo.solicitudes_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Manejo global y centralizado de excepciones para el microservicio.
 * Devuelve respuestas JSON estandarizadas con timestamp, status, error y mensaje.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Maneja errores de validación de entrada (Bean Validation).
     * Devuelve un HTTP 400 con la lista de campos inválidos.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<String> errores = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .toList();

        Map<String, Object> body = buildResponseBody(
                HttpStatus.BAD_REQUEST,
                "Error de validación",
                errores
        );

        return ResponseEntity.badRequest().body(body);
    }

    /**
     * Maneja solicitudes no encontradas.
     * Devuelve un HTTP 404.
     */
    @ExceptionHandler(SolicitudNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(SolicitudNotFoundException ex) {
        Map<String, Object> body = buildResponseBody(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                null
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    /**
     * Maneja transiciones de estado inválidas.
     * Devuelve un HTTP 409 Conflict.
     */
    @ExceptionHandler(InvalidStateTransitionException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidTransition(InvalidStateTransitionException ex) {
        Map<String, Object> body = buildResponseBody(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                null
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }


    /**
     * Construye el cuerpo de respuesta estándar para errores.
     *
     * @param status  código HTTP del error
     * @param mensaje descripción del error
     * @param detalles detalles adicionales (puede ser null)
     * @return mapa con la estructura de respuesta
     */
    private Map<String, Object> buildResponseBody(HttpStatus status, String mensaje, Object detalles) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("mensaje", mensaje);

        if (detalles != null) {
            body.put("detalles", detalles);
        }

        return body;
    }
}
