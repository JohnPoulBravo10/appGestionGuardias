package com.sistema.guardias.empleado_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Evento Kafka que representa una acción sobre un empleado.
 * Es publicado en el topic "empleados-events" y consumido por los demás microservicios
 * para ejecutar acciones reactivas coordinadas (liberar guardias, dar de baja usuario, etc.).
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
