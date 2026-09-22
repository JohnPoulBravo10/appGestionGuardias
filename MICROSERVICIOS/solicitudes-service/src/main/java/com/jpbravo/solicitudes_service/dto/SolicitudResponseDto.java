package com.jpbravo.solicitudes_service.dto;

import com.jpbravo.solicitudes_service.model.EstadoSolicitud;
import com.jpbravo.solicitudes_service.model.InfoGuardia;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/* DTO de salida que expone los datos de una solicitud de cambio de guardia.
   Separa la representación externa del documento MongoDB interno. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudResponseDto {

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
