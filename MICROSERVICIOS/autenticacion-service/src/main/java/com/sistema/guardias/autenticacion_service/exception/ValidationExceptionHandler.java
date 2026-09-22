package com.sistema.guardias.autenticacion_service.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/* Manejador global de excepciones de validación y seguridad.
   Captura errores de Jakarta Validation, excepciones de negocio
   (CampoDuplicadoException) y fallas de autenticación. */
@RestControllerAdvice
@Slf4j
public class ValidationExceptionHandler {

    /* Maneja errores de validación Jakarta (anotaciones @Valid).
       Extrae cada campo con error y su mensaje, devolviendo HTTP 400. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidacion(
            MethodArgumentNotValidException ex) {

        Map<String, String> erroresCampo = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error -> erroresCampo.put(
                        error.getField(),
                        error.getDefaultMessage()));

        log.warn("Validación de entrada fallida en campos: {}", erroresCampo.keySet());

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("errores", erroresCampo);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(respuesta);
    }

    /* Maneja errores de unicidad (usuario o DNI duplicado).
       Devuelve HTTP 409 Conflict con el campo afectado. */
    @ExceptionHandler(CampoDuplicadoException.class)
    public ResponseEntity<Map<String, Object>> manejarDuplicado(
            CampoDuplicadoException ex) {

        log.warn("Conflicto al procesar registro: campo '{}' duplicado", ex.getCampo());

        Map<String, String> erroresCampo = new HashMap<>();
        erroresCampo.put(ex.getCampo(), ex.getMessage());

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("errores", erroresCampo);

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(respuesta);
    }

    /* Maneja credenciales inválidas en login.
       Devuelve HTTP 401 Unauthorized. */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> manejarCredencialesInvalidas(BadCredentialsException ex) {
        log.warn("Intento de inicio de sesión fallido: credenciales incorrectas");
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("error", "Usuario o contraseña incorrectos");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
    }

    /* Maneja intentos de login con cuenta desactivada.
       Devuelve HTTP 403 Forbidden. */
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<Map<String, Object>> manejarUsuarioDesactivado(DisabledException ex) {
        log.warn("Intento de inicio de sesión rechazado: cuenta de usuario desactivada");
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("error", "La cuenta se encuentra desactivada");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(respuesta);
    }

    /* Maneja argumentos ilegales (como registrar administradores por endpoint público).
       Devuelve HTTP 400 Bad Request. */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> manejarArgumentoInvalido(IllegalArgumentException ex) {
        log.warn("Petición rechazada por argumento inválido: {}", ex.getMessage());
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
    }
}
