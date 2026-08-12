package com.jpbravo.solicitudes_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Documento MongoDB que representa una solicitud de cambio de guardia.
 * Cada solicitud es emitida por un empleado y debe ser resuelta
 * (aprobada o rechazada) por un administrador.
 */
@Document(collection = "solicitudes_cambio_guardia")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudCambioGuardia {

    /** Identificador único generado por MongoDB. */
    @Id
    private String id;

    /** Nombre completo del empleado que solicita el cambio. */
    private String nombreEmpleado;

    /** DNI del empleado solicitante. */
    private String empleadoDni;

    /** Información de la guardia asociada a la solicitud. */
    private InfoGuardia infoGuardia;

    /** Motivo por el cual se solicita el cambio de guardia. */
    private String motivo;

    /** Estado actual de la solicitud: PENDIENTE, APROBADA o RECHAZADA. */
    private EstadoSolicitud estado;

    /** (Opcional) Nombre del empleado propuesto como reemplazo. */
    private String nombreEmpleadoReemplazo;

    /** (Opcional) DNI del empleado propuesto como reemplazo. */
    private String empleadoReemplazoDni;

    /** Fecha y hora en que se creó la solicitud. */
    private LocalDateTime fechaCreacion;

    /** (Opcional) Fecha y hora en que se resolvió la solicitud. */
    private LocalDateTime fechaResolucion;

    /** (Opcional) Observación del administrador al resolver la solicitud. */
    private String observacionAdmin;
}
