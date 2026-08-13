package com.jpbravo.notification_service.controller;

import com.jpbravo.notification_service.model.Notificacion;
import com.jpbravo.notification_service.service.NotificacionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {


    private final NotificacionService service;

    public NotificacionController(NotificacionService service ) {
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
    public ResponseEntity<List<Notificacion>> obtenerPorEmpleado(@PathVariable Long empleadoDni) {
        return ResponseEntity.ok(service.obtenerPorEmpleado(empleadoDni));
    }

    @GetMapping("/empleado/{empleadoDni}/no-leidas")
    public ResponseEntity<List<Notificacion>> obtenerNoLeidas(@PathVariable Long empleadoDni) {
        return ResponseEntity.ok(service.obtenerNoLeidasPorEmpleado(empleadoDni));
    }

    @PatchMapping("/{id}/leida")
    public ResponseEntity<Notificacion>  marcarComoLeida(@PathVariable String id ) {
        return ResponseEntity.ok(service.marcarComoLeida(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        service.eliminar(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}