package com.jpbravo.notification_service.controller;

import com.jpbravo.notification_service.model.Notificacion;
import com.jpbravo.notification_service.service.NotificacionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    private final NotificacionService service;

    public NotificacionController(NotificacionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Notificacion> crear(@RequestBody Notificacion notificacion) {

        Notificacion creada = service.crear(notificacion);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(creada);
    }

    @GetMapping("/empleado/{empleadoDni}")
    public ResponseEntity<List<Notificacion>> obtenerPorEmpleado(
            @PathVariable Long empleadoDni,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Dni", required = false) String userDni) {
        requireAdminOrOwner(roles, userDni, empleadoDni);
        return ResponseEntity.ok(service.obtenerPorEmpleado(empleadoDni));
    }

    @GetMapping("/empleado/{empleadoDni}/no-leidas")
    public ResponseEntity<List<Notificacion>> obtenerNoLeidas(
            @PathVariable Long empleadoDni,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Dni", required = false) String userDni) {
        requireAdminOrOwner(roles, userDni, empleadoDni);
        return ResponseEntity.ok(service.obtenerNoLeidasPorEmpleado(empleadoDni));
    }

    @GetMapping("/rol/{rol}")
    public ResponseEntity<List<Notificacion>> obtenerPorRol(@PathVariable String rol) {
        return ResponseEntity.ok(service.obtenerPorRol(rol));
    }

    @GetMapping("/rol/{rol}/no-leidas")
    public ResponseEntity<List<Notificacion>> obtenerNoLeidasPorRol(@PathVariable String rol) {
        return ResponseEntity.ok(service.obtenerNoLeidasPorRol(rol));
    }

    @PatchMapping("/{id}/leida")
    public ResponseEntity<Notificacion> marcarComoLeida(@PathVariable String id) {
        return ResponseEntity.ok(service.marcarComoLeida(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {

        service.eliminar(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    private boolean isAdmin(String roles) {
        return roles != null && roles.contains("ADMIN");
    }

    private void requireAdminOrOwner(String roles, String userDni, Long targetDni) {
        if (!isAdmin(roles) && (userDni == null || !userDni.equals(String.valueOf(targetDni)))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado: No tiene permisos para este recurso");
        }
    }
}