package com.jpbravo.guardia_service.producer;

import com.jpbravo.guardia_service.event.GuardiaEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GuardiaEventProducer {

    private static final String TOPIC =
            "guardias-events";

    private final KafkaTemplate<String, GuardiaEvent>
            kafkaTemplate;

    public GuardiaEventProducer(
            KafkaTemplate<String, GuardiaEvent> kafkaTemplate
    ) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Retry(name = "kafkaRetry", fallbackMethod = "fallbackPublicacion")
    @CircuitBreaker(name = "kafkaCB", fallbackMethod = "fallbackPublicacion")
    public void publicarEvento(
            GuardiaEvent evento
    ) {
        kafkaTemplate.send(
                TOPIC,
                String.valueOf(evento.getGuardiaId()),
                evento
        );
    }

    public void fallbackPublicacion(GuardiaEvent evento, Exception e) {
        log.error("Error al publicar evento de guardia en Kafka. ID: {}, Error: {}", evento.getGuardiaId(), e.getMessage());
        // Se registra la falla para no perder la operación y permitir que el flujo de negocio principal continúe.
    }
}
