package com.jpbravo.guardia_service.producer;

import com.jpbravo.guardia_service.event.GuardiaEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
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

    public void publicarEvento(
            GuardiaEvent evento
    ) {
        kafkaTemplate.send(
                TOPIC,
                String.valueOf(evento.getGuardiaId()),
                evento
        );
    }
}
