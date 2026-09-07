package com.sistema.guardias.empleado_service.producer;

import com.sistema.guardias.empleado_service.event.EmpleadoEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

/**
 * Productor Kafka responsable de publicar eventos del ciclo de vida de empleados.
 * Utiliza el DNI del empleado como key para garantizar orden de procesamiento
 * por partición para un mismo empleado.
 */
@Service
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
    public void publicarEvento(EmpleadoEvent evento) {
        kafkaTemplate.send(
                TOPIC,
                String.valueOf(evento.getEmpleadoDni()),
                evento
        );
    }
}
