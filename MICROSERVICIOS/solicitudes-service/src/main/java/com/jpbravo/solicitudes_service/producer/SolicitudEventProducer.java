package com.jpbravo.solicitudes_service.producer;

import com.jpbravo.solicitudes_service.event.SolicitudEvent;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class SolicitudEventProducer {

    private static final String TOPIC = "solicitudes-events";

    @Autowired
    private KafkaTemplate<String, SolicitudEvent> kafkaTemplate;

    public void publicarEvento(SolicitudEvent evento) {

        System.out.println("PUBLICANDO EVENTO DE SOLICITUD: " + evento);

        kafkaTemplate.send(TOPIC, evento);
    }
}
