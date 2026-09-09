package com.jpbravo.api_gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @RequestMapping("/empleados")
    public Mono<ResponseEntity<String>> empleadosFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("El servicio de empleados no está disponible temporalmente. Por favor, intente más tarde."));
    }

    @RequestMapping("/guardias")
    public Mono<ResponseEntity<String>> guardiasFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("El servicio de guardias no está disponible temporalmente. Por favor, intente más tarde."));
    }

    @RequestMapping("/auth")
    public Mono<ResponseEntity<String>> authFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("El servicio de autenticación no está disponible temporalmente. Por favor, intente más tarde."));
    }

    @RequestMapping("/solicitudes")
    public Mono<ResponseEntity<String>> solicitudesFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("El servicio de solicitudes no está disponible temporalmente. Por favor, intente más tarde."));
    }

    @RequestMapping("/notificaciones")
    public Mono<ResponseEntity<String>> notificacionesFallback() {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("El servicio de notificaciones no está disponible temporalmente. Por favor, intente más tarde."));
    }
}
