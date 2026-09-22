package com.sistema.guardias.empleado_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/* Evento emitido por empleado-service ante cambios en su ciclo de vida.
   Se publica en el topic "empleados-events" y es consumido por otros microservicios. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmpleadoEvent {

    private TipoEmpleadoEvent tipoEvento;

    private Long empleadoDni;

    private String nombre;

    private String apellido;

    private String rol;

    private LocalDateTime fechaEvento;
}
