package com.jpbravo.notification_service.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;

import com.jpbravo.notification_service.event.SolicitudEvent;
import com.jpbravo.notification_service.model.Notificacion;
import com.jpbravo.notification_service.model.TipoNotificacion;
import com.jpbravo.notification_service.service.NotificacionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class SolicitudEventConsumer {

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(
            topics = "solicitudes-events",
            groupId = "notification-solicitudes-group",
            containerFactory = "solicitudKafkaListenerContainerFactory"
    )
    public void consumirEvento(String mensaje) {

        try {

            SolicitudEvent evento = objectMapper.readValue(mensaje, SolicitudEvent.class);

            System.out.println("EVENTO DE SOLICITUD RECIBIDO: " + evento);

            if (evento.getTipoEvento() == null) {
                return;
            }

            switch (evento.getTipoEvento()) {

                case SOLICITUD_CAMBIO_CREADA -> crearNotificacionAdministrador(evento);

                case SOLICITUD_CAMBIO_ACEPTADA -> crearNotificacionSolicitudAceptada(evento);

                case SOLICITUD_CAMBIO_RECHAZADA -> crearNotificacionSolicitudRechazada(evento);
            }

        } catch (Exception error) {

            System.err.println(
                    "Error procesando evento de solicitud: " + error.getMessage()
            );
        }
    }

    private void crearNotificacionAdministrador(SolicitudEvent evento) {

        Notificacion notificacion = Notificacion.builder()
                .rolDestinatario("ADMINISTRADOR")
                .tipo(TipoNotificacion.SOLICITUD_CAMBIO_CREADA)
                .titulo("Nueva solicitud de cambio")
                .mensaje(evento.getNombreEmpleado()
                        + " solicitó un cambio para la guardia "
                        + evento.getGuardiaId()
                        + ".")
                .build();

        notificacionService.crear(notificacion);
    }

    private void crearNotificacionSolicitudAceptada(SolicitudEvent evento) {

        Long empleadoDni = Long.valueOf(evento.getEmpleadoDni());

        Notificacion notificacion = Notificacion.builder()
                .empleadoDni(empleadoDni)
                .tipo(TipoNotificacion.SOLICITUD_CAMBIO_ACEPTADA)
                .titulo("Solicitud aprobada")
                .mensaje("Tu solicitud de cambio de guardia fue aprobada.")
                .build();

        notificacionService.crear(notificacion);
    }

    private void crearNotificacionSolicitudRechazada(SolicitudEvent evento) {

        Long empleadoDni = Long.valueOf(evento.getEmpleadoDni());

        String mensaje = "Tu solicitud de cambio de guardia fue rechazada.";

        if (evento.getObservacionAdmin() != null
                && !evento.getObservacionAdmin().isBlank()) {

            mensaje += " Observación: " + evento.getObservacionAdmin();
        }

        Notificacion notificacion = Notificacion.builder()
                .empleadoDni(empleadoDni)
                .tipo(TipoNotificacion.SOLICITUD_CAMBIO_RECHAZADA)
                .titulo("Solicitud rechazada")
                .mensaje(mensaje)
                .build();

        notificacionService.crear(notificacion);
    }
}