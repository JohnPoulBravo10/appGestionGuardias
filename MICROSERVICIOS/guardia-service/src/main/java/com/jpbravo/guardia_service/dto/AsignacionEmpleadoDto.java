package com.jpbravo.guardia_service.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para solicitar la reasignación de empleado en una guardia.
 * Si {@code empleadoId} es {@code null}, la guardia queda sin empleado
 * asignado (estado ABIERTA).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AsignacionEmpleadoDto {

    /** ID (DNI) del empleado a asignar, o null para dejar la guardia sin empleado. */
    private Long empleadoId;
}
