package com.jpbravo.guardia_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO espejo del evento emitido por empleado-service.
 * Permite la deserialización de eventos Kafka del topic "empleados-events".
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmpleadoEvent {

    /** Tipo de acción que originó este evento. */
    private TipoEmpleadoEvent tipoEvento;

    /** DNI del empleado afectado. */
    private Long empleadoDni;

    /** Fecha y hora en que se produjo el evento. */
    private LocalDateTime fechaEvento;
}
