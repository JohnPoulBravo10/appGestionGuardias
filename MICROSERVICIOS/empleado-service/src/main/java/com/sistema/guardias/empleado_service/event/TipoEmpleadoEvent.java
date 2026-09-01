package com.sistema.guardias.empleado_service.event;

/**
 * Tipos de eventos que puede emitir el servicio de empleados.
 * Cada tipo representa una acción del ciclo de vida del empleado
 * que requiere reacción coordinada de otros microservicios.
 */
public enum TipoEmpleadoEvent {

    /** Se emite cuando un empleado es dado de baja (soft-delete). */
    EMPLEADO_DESACTIVADO
}
