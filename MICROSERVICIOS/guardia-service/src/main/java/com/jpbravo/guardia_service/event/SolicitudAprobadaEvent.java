package com.jpbravo.guardia_service.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/* DTO espejo del evento emitido por solicitudes-service al resolver una solicitud.
   Permite la deserialización de eventos Kafka del topic "solicitudes-events".
   Solo se procesan los eventos con tipoEvento = SOLICITUD_CAMBIO_ACEPTADA,
   que indican que una solicitud de cambio fue aprobada y la guardia debe reasignarse. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudAprobadaEvent {

    private String tipoEvento;

    private String solicitudId;

    private String empleadoDni;

    private String nombreEmpleado;

    private Long guardiaId;

    private String estado;

    private String observacionAdmin;

    private Long empleadoReemplazoDni;

    private LocalDateTime fechaEvento;
}
