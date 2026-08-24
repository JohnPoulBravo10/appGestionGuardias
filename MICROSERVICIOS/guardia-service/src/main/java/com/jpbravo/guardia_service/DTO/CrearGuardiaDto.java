package com.jpbravo.guardia_service.dto;

import com.jpbravo.guardia_service.model.Rol;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO de entrada para la creación y edición de guardias.
 * Centraliza las validaciones Jakarta que se aplican
 * tanto al endpoint POST como al PUT.
 *
 * <p>El campo {@code empleadoId} es opcional: si es {@code null}
 * la guardia se crea como "abierta" (sin personal asignado).</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearGuardiaDto {

    @NotNull(message = "La fecha es obligatoria")
    @FutureOrPresent(message = "La fecha no puede ser anterior a hoy")
    private LocalDate fecha;

    @NotNull(message = "La hora de inicio es obligatoria")
    private LocalTime horaInicio;

    @NotNull(message = "La hora de fin es obligatoria")
    private LocalTime horaFin;

    @NotNull(message = "El área de trabajo es obligatoria")
    private Rol rol;

    /** Opcional: DNI del empleado asignado */
    private Long empleadoId;
}
