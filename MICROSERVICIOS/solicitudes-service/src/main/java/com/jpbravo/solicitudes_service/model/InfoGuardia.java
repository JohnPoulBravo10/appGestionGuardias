package com.jpbravo.solicitudes_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/* Subdocumento embebido que almacena la información de la guardia
   asociada a la solicitud de cambio.
   Se almacenan los datos directamente (no como referencia) para
   garantizar la consistencia histórica de la solicitud. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InfoGuardia {

    private Long guardiaId;

    private LocalDate fecha;

    private LocalTime horaInicio;

    private LocalTime horaFin;

    private String rol;
}
