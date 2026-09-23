package com.jpbravo.solicitudes_service.producer;

import com.jpbravo.solicitudes_service.event.SolicitudEvent;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;

// Productor de eventos de solicitud
@Service
@Slf4j
public class SolicitudEventProducer {

    private static final String TOPIC = "solicitudes-events";

    @Autowired
    private KafkaTemplate<String, SolicitudEvent> kafkaTemplate;

    @Retry(name = "kafkaRetry", fallbackMethod = "fallbackPublicacion")
    @CircuitBreaker(name = "kafkaCB", fallbackMethod = "fallbackPublicacion")
    public void publicarEvento(SolicitudEvent evento) {

        log.info("Publicando evento de solicitud (tipo: {}, solicitudId: {}, empleadoDni: {}) en topic '{}'",
                evento.getTipoEvento(), evento.getSolicitudId(), evento.getEmpleadoDni(), TOPIC);

        kafkaTemplate.send(TOPIC, evento);
    }

    public void fallbackPublicacion(SolicitudEvent evento, Exception e) {
        log.error("Error al publicar evento en Kafka. Evento: {}, Error: {}", evento, e.getMessage());
        // Se registra la falla para no perder la operación y permitir que el flujo de negocio principal continúe.
    }
}
