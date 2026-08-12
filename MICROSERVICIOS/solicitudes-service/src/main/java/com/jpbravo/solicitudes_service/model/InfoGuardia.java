package com.jpbravo.solicitudes_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Subdocumento embebido que almacena la información de la guardia
 * asociada a la solicitud de cambio.
 * Se almacenan los datos directamente (no como referencia) para
 * garantizar la consistencia histórica de la solicitud.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InfoGuardia {

    /** ID original de la guardia en el guardia-service. */
    private Long guardiaId;

    /** Fecha programada de la guardia. */
    private LocalDate fecha;

    /** Hora de inicio de la guardia. */
    private LocalTime horaInicio;

    /** Hora de fin de la guardia. */
    private LocalTime horaFin;

    /** Rol asignado en la guardia (ej: ENFERMERIA, LIMPIEZA). */
    private String rol;
}
