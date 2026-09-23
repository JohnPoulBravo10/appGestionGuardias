package com.jpbravo.notification_service.consumer;

import com.jpbravo.notification_service.event.GuardiaEvent;
import com.jpbravo.notification_service.model.Notificacion;
import com.jpbravo.notification_service.model.TipoNotificacion;
import com.jpbravo.notification_service.service.NotificacionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;

// Consumidor Kafka que reacciona a eventos del ciclo de vida de las guardias.
// Crea notificaciones para los empleados cuando se les asigna, modifica o elimina una guardia.
@Service
@Slf4j
public class GuardiaEventConsumer {

    @Autowired
    private NotificacionService notificacionService;

    @KafkaListener(
            topics = "guardias-events", 
            groupId = "notification-service-group",
            properties = {
                "spring.json.value.default.type=com.jpbravo.notification_service.event.GuardiaEvent"
            }
    )
    @Retry(name = "consumerRetry", fallbackMethod = "fallbackProcesamiento")
    @CircuitBreaker(name = "consumerCB", fallbackMethod = "fallbackProcesamiento")
    public void consumirEvento(GuardiaEvent evento) {

        log.info("Evento de guardia recibido (tipo: {}, guardiaId: {}, empleadoId: {})",
                evento.getTipoEvento(), evento.getGuardiaId(), evento.getEmpleadoId());

        if (evento.getTipoEvento() == null) {
            return;
        }

        switch (evento.getTipoEvento()) {

            case GUARDIA_ASIGNADA -> {

                Notificacion notificacion = Notificacion.builder()
                        .empleadoDni(evento.getEmpleadoId())
                        .guardiaId(evento.getGuardiaId())
                        .tipo(TipoNotificacion.GUARDIA_ASIGNADA)
                        .titulo("Nueva guardia asignada")
                        .mensaje("Se te asignó una guardia para el "
                                + evento.getFecha()
                                + " de "
                                + evento.getHoraInicio()
                                + " a "
                                + evento.getHoraFin()
                                + ".")
                        .build();

                notificacionService.crear(notificacion);
            }

            case GUARDIA_MODIFICADA -> {

                Notificacion notificacion = Notificacion.builder()
                        .empleadoDni(evento.getEmpleadoId())
                        .guardiaId(evento.getGuardiaId())
                        .tipo(TipoNotificacion.GUARDIA_MODIFICADA)
                        .titulo("Guardia modificada")
                        .mensaje("Tu guardia del "
                                + evento.getFecha()
                                + " fue modificada. El horario es de "
                                + evento.getHoraInicio()
                                + " a "
                                + evento.getHoraFin()
                                + ".")
                        .build();

                notificacionService.crear(notificacion);
            }

            case GUARDIA_ELIMINADA -> {

                Notificacion notificacion = Notificacion.builder()
                        .empleadoDni(evento.getEmpleadoId())
                        .guardiaId(evento.getGuardiaId())
                        .tipo(TipoNotificacion.GUARDIA_ELIMINADA)
                        .titulo("Guardia eliminada")
                        .mensaje("Tu guardia del "
                                + evento.getFecha()
                                + " de "
                                + evento.getHoraInicio()
                                + " a "
                                + evento.getHoraFin()
                                + " fue eliminada.")
                        .build();

                notificacionService.crear(notificacion);
            }
        }
    }

    // Manejo de fallos en caso de que el procesamiento falle tras los reintentos.
    public void fallbackProcesamiento(GuardiaEvent evento, Exception e) {
        log.error("Error definitivo al procesar evento de guardia en notificación. Evento: {}, Error: {}", evento, e.getMessage());
        // Se registra la falla para evitar un Poison Pill y commitear el offset.
    }
}