package com.jpbravo.api_gateway.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

/* Controlador que gestiona las respuestas de respaldo (fallbacks) cuando 
   los microservicios internos no están disponibles o fallan. */
@RestController
@RequestMapping("/fallback")
@Slf4j
public class FallbackController {

    // Devuelve un error 503 (Service Unavailable) si el servicio de empleados falla.
    @RequestMapping("/empleados")
    public Mono<ResponseEntity<String>> empleadosFallback() {
        log.warn("Fallback activado: el servicio de empleados no está disponible o superó el tiempo límite");
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("El servicio de empleados no está disponible temporalmente. Por favor, intente más tarde."));
    }

    // Devuelve un error 503 si el servicio de guardias falla.
    @RequestMapping("/guardias")
    public Mono<ResponseEntity<String>> guardiasFallback() {
        log.warn("Fallback activado: el servicio de guardias no está disponible o superó el tiempo límite");
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("El servicio de guardias no está disponible temporalmente. Por favor, intente más tarde."));
    }

    // Devuelve un error 503 si el servicio de autenticación falla.
    @RequestMapping("/auth")
    public Mono<ResponseEntity<String>> authFallback() {
        log.warn("Fallback activado: el servicio de autenticación no está disponible o superó el tiempo límite");
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("El servicio de autenticación no está disponible temporalmente. Por favor, intente más tarde."));
    }

    // Devuelve un error 503 si el servicio de solicitudes falla.
    @RequestMapping("/solicitudes")
    public Mono<ResponseEntity<String>> solicitudesFallback() {
        log.warn("Fallback activado: el servicio de solicitudes no está disponible o superó el tiempo límite");
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("El servicio de solicitudes no está disponible temporalmente. Por favor, intente más tarde."));
    }

    // Devuelve un error 503 si el servicio de notificaciones falla.
    @RequestMapping("/notificaciones")
    public Mono<ResponseEntity<String>> notificacionesFallback() {
        log.warn("Fallback activado: el servicio de notificaciones no está disponible o superó el tiempo límite");
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("El servicio de notificaciones no está disponible temporalmente. Por favor, intente más tarde."));
    }
}
