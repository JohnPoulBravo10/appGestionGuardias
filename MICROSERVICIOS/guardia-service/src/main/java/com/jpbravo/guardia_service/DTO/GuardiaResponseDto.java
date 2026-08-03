package com.jpbravo.guardia_service.DTO;

import com.jpbravo.guardia_service.model.EstadoGuardia;
import com.jpbravo.guardia_service.model.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuardiaResponseDto {
    
     private Long id;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;

    private Long empleadoId;
    private String empleadoNombre;

    private Rol rol;
    private EstadoGuardia estado;
}
