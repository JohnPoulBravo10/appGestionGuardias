package com.jpbravo.solicitudes_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/* DTO espejo del evento emitido por empleado-service.
   Permite la deserialización de eventos Kafka del topic "empleados-events". */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmpleadoEvent {

    private TipoEmpleadoEvent tipoEvento;

    private Long empleadoDni;

    private LocalDateTime fechaEvento;
}
