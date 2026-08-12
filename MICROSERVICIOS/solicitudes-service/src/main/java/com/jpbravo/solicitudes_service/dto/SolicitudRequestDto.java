package com.jpbravo.solicitudes_service.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO de entrada para crear una solicitud de cambio de guardia.
 * Aplica validaciones estrictas en las fronteras para rechazar
 * datos incompletos o nulos.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudRequestDto {

    /** Nombre completo del empleado solicitante. */
    @NotBlank(message = "El nombre del empleado es obligatorio")
    private String nombreEmpleado;

    /** DNI del empleado solicitante. */
    @NotBlank(message = "El DNI del empleado es obligatorio")
    private String empleadoDni;

    /** Información de la guardia asociada a la solicitud. */
    @NotNull(message = "La información de la guardia es obligatoria")
    @Valid
    private InfoGuardiaDto infoGuardia;

    /** Motivo del cambio solicitado. */
    @NotBlank(message = "El motivo es obligatorio")
    private String motivo;

    /** (Opcional) Nombre del empleado propuesto como reemplazo. */
    private String nombreEmpleadoReemplazo;

    /** (Opcional) DNI del empleado propuesto como reemplazo. */
    private String empleadoReemplazoDni;

    /**
     * DTO anidado con la información de la guardia.
     * Se valida que los campos obligatorios estén presentes.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InfoGuardiaDto {

        /** ID original de la guardia. */
        @NotNull(message = "El ID de la guardia es obligatorio")
        private Long guardiaId;

        /** Fecha de la guardia. */
        @NotNull(message = "La fecha de la guardia es obligatoria")
        private LocalDate fecha;

        /** Hora de inicio de la guardia. */
        @NotNull(message = "La hora de inicio es obligatoria")
        private LocalTime horaInicio;

        /** Hora de fin de la guardia. */
        @NotNull(message = "La hora de fin es obligatoria")
        private LocalTime horaFin;

        /** Rol asignado en la guardia. */
        @NotBlank(message = "El rol es obligatorio")
        private String rol;
    }
}
