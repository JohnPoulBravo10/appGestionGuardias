package com.jpbravo.guardia_service.event;

import com.jpbravo.guardia_service.model.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuardiaEvent {

    private TipoGuardiaEvent tipoEvento;

    private Long guardiaId;

    private Long empleadoId;

    private LocalDate fecha;

    private LocalTime horaInicio;

    private LocalTime horaFin;

    private Rol rol;

    private LocalDateTime fechaEvento;
}
