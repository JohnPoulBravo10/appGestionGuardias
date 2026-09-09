package com.jpbravo.solicitudes_service.consumer;

import com.jpbravo.solicitudes_service.event.EmpleadoEvent;
import com.jpbravo.solicitudes_service.event.TipoEmpleadoEvent;
import com.jpbravo.solicitudes_service.model.EstadoSolicitud;
import com.jpbravo.solicitudes_service.model.SolicitudCambioGuardia;
import com.jpbravo.solicitudes_service.repository.SolicitudCambioGuardiaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Consumidor Kafka que reacciona a eventos del ciclo de vida de empleados.
 * Al recibir EMPLEADO_DESACTIVADO, rechaza automáticamente todas las solicitudes
 * de cambio de guardia pendientes del empleado dado de baja.
 */
@Service
@Slf4j
public class EmpleadoEventConsumer {

    @Autowired
    private SolicitudCambioGuardiaRepository solicitudRepository;

    @KafkaListener(
            topics = "empleados-events",
            groupId = "solicitudes-service-empleado-group"
    )
    @Retry(name = "consumerRetry", fallbackMethod = "fallbackProcesamiento")
    @CircuitBreaker(name = "consumerCB", fallbackMethod = "fallbackProcesamiento")
    public void procesarEventoEmpleado(EmpleadoEvent evento) {

        if (evento.getTipoEvento() != TipoEmpleadoEvent.EMPLEADO_DESACTIVADO) {
            return;
        }

        String empleadoDni = String.valueOf(evento.getEmpleadoDni());

        System.out.println("[solicitudes-service] Empleado desactivado, DNI: " + empleadoDni
                + ". Rechazando solicitudes pendientes...");

        List<SolicitudCambioGuardia> solicitudesPendientes = solicitudRepository
                .findByEmpleadoDniAndEstado(empleadoDni, EstadoSolicitud.PENDIENTE);

        for (SolicitudCambioGuardia solicitud : solicitudesPendientes) {
            solicitud.setEstado(EstadoSolicitud.RECHAZADA);
            solicitud.setFechaResolucion(LocalDateTime.now());
            solicitud.setObservacionAdmin("Rechazada automáticamente por baja del empleado.");
        }

        solicitudRepository.saveAll(solicitudesPendientes);

        System.out.println("[solicitudes-service] " + solicitudesPendientes.size()
                + " solicitudes rechazadas para DNI: " + empleadoDni);
    }

    public void fallbackProcesamiento(EmpleadoEvent evento, Exception e) {
        log.error("Error definitivo al procesar evento de empleado. Evento: {}, Error: {}", evento, e.getMessage());
        // Se registra la falla tras agotar reintentos para evitar un Poison Pill y avanzar el offset
    }
}
