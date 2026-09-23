package com.jpbravo.notification_service.service;

import com.jpbravo.notification_service.model.Notificacion;
import com.jpbravo.notification_service.repository.NotificacionRepository;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
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

        Notificacion guardada = repository.save(notificacion);

        String destinatario = guardada.getEmpleadoDni() != null
                ? "DNI " + guardada.getEmpleadoDni()
                : "Rol " + guardada.getRolDestinatario();

        log.info("Notificación creada (ID: {}, tipo: {}, destinatario: {})",
                guardada.getId(), guardada.getTipo(), destinatario);

        return guardada;
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
        Notificacion guardada = repository.save(notificacion);
        log.info("Notificación ID {} marcada como leída", id);

        return guardada;
    }

    // Elimina una notificación por su ID.
    public void eliminar(String id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("Notificación no encontrada");
        }

        repository.deleteById(id);
        log.info("Notificación ID {} eliminada", id);
    }
}