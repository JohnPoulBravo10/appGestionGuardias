package com.jpbravo.solicitudes_service.dto;

import com.jpbravo.solicitudes_service.model.EstadoSolicitud;
import com.jpbravo.solicitudes_service.model.InfoGuardia;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de salida que expone los datos de una solicitud de cambio de guardia.
 * Separa la representación externa del documento MongoDB interno.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudResponseDto {

    /** Identificador único de la solicitud. */
    private String id;

    /** Nombre completo del empleado solicitante. */
    private String nombreEmpleado;

    /** DNI del empleado solicitante. */
    private String empleadoDni;

    /** Información de la guardia asociada. */
    private InfoGuardia infoGuardia;

    /** Motivo del cambio solicitado. */
    private String motivo;

    /** Estado actual de la solicitud. */
    private EstadoSolicitud estado;

    /** (Opcional) Nombre del empleado propuesto como reemplazo. */
    private String nombreEmpleadoReemplazo;

    /** (Opcional) DNI del empleado propuesto como reemplazo. */
    private Long empleadoReemplazoDni;

    /** Fecha y hora de creación de la solicitud. */
    private LocalDateTime fechaCreacion;

    /** (Opcional) Fecha y hora de resolución. */
    private LocalDateTime fechaResolucion;

    /** (Opcional) Observación del administrador. */
    private String observacionAdmin;
}
