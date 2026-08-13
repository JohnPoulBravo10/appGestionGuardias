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

    public Notificacion crear(  Notificacion notificacion ) {
        notificacion.setId(null);
        notificacion.setLeida(false);
        notificacion.setFechaCreacion(
                LocalDateTime.now()
        );

        return repository.save(notificacion);
    }

    public List<Notificacion> obtenerPorEmpleado(Long empleadoDni ) {
        return repository.findByEmpleadoDniOrderByFechaCreacionDesc(empleadoDni);
    }

    public List<Notificacion> obtenerNoLeidasPorEmpleado(Long empleadoDni) {
        return repository.findByEmpleadoDniAndLeidaFalseOrderByFechaCreacionDesc(empleadoDni);
    }

    public Notificacion marcarComoLeida(String id) {
        Notificacion notificacion =
                repository.findById(id)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Notificación no encontrada"
                                        )
                        );

        notificacion.setLeida(true);

        return repository.save(
                notificacion
        );
    }

    public void eliminar(String id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException(
                    "Notificación no encontrada"
            );
        }

        repository.deleteById(id);
    }
}