package com.jpbravo.solicitudes_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudEvent {

    private TipoSolicitudEvent tipoEvento;

    private String solicitudId;

    private String empleadoDni;

    private String nombreEmpleado;

    private Long guardiaId;

    private String estado;

    private String observacionAdmin;

    /** DNI del empleado de reemplazo asignado al aprobar la solicitud. */
    private Long empleadoReemplazoDni;

    private LocalDateTime fechaEvento;
}