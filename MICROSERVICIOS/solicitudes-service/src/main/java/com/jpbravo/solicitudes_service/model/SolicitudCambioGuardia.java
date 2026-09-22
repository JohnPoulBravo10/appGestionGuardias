package com.jpbravo.solicitudes_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/* Documento MongoDB que representa una solicitud de cambio de guardia.
   Cada solicitud es emitida por un empleado y debe ser resuelta
   (aprobada o rechazada) por un administrador. */
@Document(collection = "solicitudes_cambio_guardia")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudCambioGuardia {

    @Id
    private String id;

    private String nombreEmpleado;

    private String empleadoDni;

    private InfoGuardia infoGuardia;

    private String motivo;

    private EstadoSolicitud estado;

    private String nombreEmpleadoReemplazo;

    private Long empleadoReemplazoDni;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaResolucion;

    private String observacionAdmin;
}
