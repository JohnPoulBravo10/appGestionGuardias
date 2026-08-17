package com.jpbravo.notification_service.event;

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

    private LocalDateTime fechaEvento;
}