package com.jpbravo.notification_service.service;

import com.jpbravo.notification_service.model.Notificacion;
import com.jpbravo.notification_service.repository.NotificacionRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificacionService {

    private final NotificacionRepository repository;

    public NotificacionService(NotificacionRepository repository) {
        this.repository = repository;
    }

    // Crea y guarda una nueva notificación, inicializando su estado a "no leída".
    public Notificacion crear(Notificacion notificacion) {

        notificacion.setId(null);
        notificacion.setLeida(false);
        notificacion.setFechaCreacion(LocalDateTime.now());

        return repository.save(notificacion);
    }

    // Devuelve todas las notificaciones de un empleado específico.
    public List<Notificacion> obtenerPorEmpleado(Long empleadoDni) {
        return repository.findByEmpleadoDniOrderByFechaCreacionDesc(empleadoDni);
    }

    // Devuelve todas las notificaciones no leídas de un empleado específico.
    public List<Notificacion> obtenerNoLeidasPorEmpleado(Long empleadoDni) {
        return repository.findByEmpleadoDniAndLeidaFalseOrderByFechaCreacionDesc(empleadoDni);
    }

    // Devuelve todas las notificaciones destinadas a un rol específico.
    public List<Notificacion> obtenerPorRol(String rolDestinatario) {
        return repository.findByRolDestinatarioOrderByFechaCreacionDesc(rolDestinatario);
    }

    // Devuelve todas las notificaciones no leídas destinadas a un rol específico.
    public List<Notificacion> obtenerNoLeidasPorRol(String rolDestinatario) {
        return repository.findByRolDestinatarioAndLeidaFalseOrderByFechaCreacionDesc(rolDestinatario);
    }

    // Actualiza el estado de una notificación específica a "leída".
    public Notificacion marcarComoLeida(String id) {

        Notificacion notificacion = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));

        notificacion.setLeida(true);

        return repository.save(notificacion);
    }

    // Elimina una notificación por su ID.
    public void eliminar(String id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("Notificación no encontrada");
        }

        repository.deleteById(id);
    }
}