package com.jpbravo.guardia_service.consumer;

import com.jpbravo.guardia_service.event.SolicitudAprobadaEvent;
import com.jpbravo.guardia_service.service.GuardiaService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

/**
 * Consumidor Kafka que reacciona a eventos de solicitud de cambio de guardia
 * emitidos por solicitudes-service.
 *
 * <p>Al recibir un evento de tipo {@code SOLICITUD_CAMBIO_ACEPTADA}, reasigna
 * el empleado de la guardia indicada al empleado de reemplazo.
 * Los demás tipos de evento (CREADA, RECHAZADA) se ignoran.</p>
 */
@Service
public class SolicitudAprobadaConsumer {

    private static final Logger log = LoggerFactory.getLogger(SolicitudAprobadaConsumer.class);

    private final GuardiaService guardiaService;

    public SolicitudAprobadaConsumer(GuardiaService guardiaService) {
        this.guardiaService = guardiaService;
    }

    @KafkaListener(
            topics = "solicitudes-events",
            groupId = "guardia-service-solicitud-group",
            properties = {
                "spring.json.value.default.type=com.jpbravo.guardia_service.event.SolicitudAprobadaEvent"
            }
    )
    @Retry(name = "consumerRetry", fallbackMethod = "fallbackProcesamiento")
    @CircuitBreaker(name = "consumerCB", fallbackMethod = "fallbackProcesamiento")
    public void procesarEventoSolicitud(SolicitudAprobadaEvent evento) {

        // Solo procesar aprobaciones; ignorar creaciones y rechazos
        if (!"SOLICITUD_CAMBIO_ACEPTADA".equals(evento.getTipoEvento())) {
            return;
        }

        log.info("Solicitud aprobada recibida: reasignando guardia {} al empleado {}",
                evento.getGuardiaId(), evento.getEmpleadoReemplazoDni());

        guardiaService.reasignarEmpleado(
                evento.getGuardiaId(),
                evento.getEmpleadoReemplazoDni()
        );

        log.info("Guardia {} reasignada exitosamente al empleado {} desde evento Kafka.",
                evento.getGuardiaId(), evento.getEmpleadoReemplazoDni());
    }

    public void fallbackProcesamiento(SolicitudAprobadaEvent evento, Exception e) {
        log.error("Error definitivo al reasignar guardia {} desde evento Kafka: {}", evento.getGuardiaId(), e.getMessage());
        // Se registra la falla tras agotar reintentos para evitar un Poison Pill y avanzar el offset
    }
}
