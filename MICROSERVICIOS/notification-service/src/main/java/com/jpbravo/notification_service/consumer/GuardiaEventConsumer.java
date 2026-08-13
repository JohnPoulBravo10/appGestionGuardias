package com.jpbravo.notification_service.consumer;

import com.jpbravo.notification_service.event.GuardiaEvent;
import com.jpbravo.notification_service.model.Notificacion;
import com.jpbravo.notification_service.model.TipoNotificacion;
import com.jpbravo.notification_service.service.NotificacionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class GuardiaEventConsumer {

    @Autowired
    private NotificacionService notificacionService;

    @KafkaListener(topics = "guardias-events", groupId = "notification-service-group")
    public void consumirEvento(GuardiaEvent evento) {

        System.out.println("EVENTO RECIBIDO DESDE KAFKA: " + evento);

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
}