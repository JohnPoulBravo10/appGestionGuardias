package com.jpbravo.guardia_service.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO espejo del evento emitido por solicitudes-service al resolver una solicitud.
 * Permite la deserialización de eventos Kafka del topic "solicitudes-events".
 *
 * <p>Solo se procesan los eventos con {@code tipoEvento} = {@code SOLICITUD_CAMBIO_ACEPTADA},
 * que indican que una solicitud de cambio fue aprobada y la guardia debe reasignarse.</p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudAprobadaEvent {

    /** Tipo de evento de solicitud (CREADA, ACEPTADA, RECHAZADA). */
    private String tipoEvento;

    /** ID de la solicitud en MongoDB. */
    private String solicitudId;

    /** DNI del empleado que solicitó el cambio. */
    private String empleadoDni;

    /** Nombre del empleado solicitante. */
    private String nombreEmpleado;

    /** ID de la guardia a reasignar. */
    private Long guardiaId;

    /** Estado de la solicitud (APROBADA, RECHAZADA, etc.). */
    private String estado;

    /** Observación del administrador. */
    private String observacionAdmin;

    /** DNI del empleado de reemplazo asignado. */
    private Long empleadoReemplazoDni;

    /** Fecha y hora del evento. */
    private LocalDateTime fechaEvento;
}
