package com.sistema.guardias.autenticacion_service.producer;

import com.sistema.guardias.autenticacion_service.event.UsuarioRegistradoEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

/**
 * Productor Kafka responsable de publicar eventos de registro de usuario.
 * Utiliza el DNI como key para garantizar orden de procesamiento
 * por partición para un mismo empleado.
 */
@Service
public class UsuarioRegistradoProducer {

    private static final Logger log = LoggerFactory.getLogger(UsuarioRegistradoProducer.class);
    private static final String TOPIC = "usuario-registrado";

    private final KafkaTemplate<String, UsuarioRegistradoEvent> kafkaTemplate;

    public UsuarioRegistradoProducer(KafkaTemplate<String, UsuarioRegistradoEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Publica un evento de usuario registrado en el topic Kafka.
     *
     * @param evento evento con los datos del perfil del nuevo usuario, nunca null
     */
    public void publicarEvento(UsuarioRegistradoEvent evento) {
        log.info("Publicando evento de registro de usuario con DNI {} en topic '{}'",
                evento.getDni(), TOPIC);

        kafkaTemplate.send(
                TOPIC,
                String.valueOf(evento.getDni()),
                evento
        );
    }
}
