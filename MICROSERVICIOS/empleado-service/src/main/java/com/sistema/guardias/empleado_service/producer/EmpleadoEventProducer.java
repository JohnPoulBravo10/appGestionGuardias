package com.sistema.guardias.empleado_service.producer;

import com.sistema.guardias.empleado_service.event.EmpleadoEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;

/**
 * Productor Kafka responsable de publicar eventos del ciclo de vida de empleados.
 * Utiliza el DNI del empleado como key para garantizar orden de procesamiento
 * por partición para un mismo empleado.
 */
@Service
@Slf4j
public class EmpleadoEventProducer {

    private static final String TOPIC = "empleados-events";

    private final KafkaTemplate<String, EmpleadoEvent> kafkaTemplate;

    public EmpleadoEventProducer(KafkaTemplate<String, EmpleadoEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Publica un evento de empleado en el topic Kafka.
     *
     * @param evento evento a publicar, nunca null
     */
    @Retry(name = "kafkaRetry", fallbackMethod = "fallbackPublicacion")
    @CircuitBreaker(name = "kafkaCB", fallbackMethod = "fallbackPublicacion")
    public void publicarEvento(EmpleadoEvent evento) {
        kafkaTemplate.send(
                TOPIC,
                String.valueOf(evento.getEmpleadoDni()),
                evento
        );
    }

    public void fallbackPublicacion(EmpleadoEvent evento, Exception e) {
        log.error("Error al publicar evento de empleado en Kafka. DNI: {}, Error: {}", evento.getEmpleadoDni(), e.getMessage());
        // Se registra la falla para no perder la operación y permitir que el flujo de negocio principal continúe.
    }
}
