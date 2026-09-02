package com.jpbravo.guardia_service.event;

/**
 * Tipos de eventos emitidos por empleado-service.
 * Espejo del enum original para deserialización de eventos Kafka.
 */
public enum TipoEmpleadoEvent {

    /** Se emite cuando se crea un nuevo empleado en el sistema. */
    EMPLEADO_CREADO,

    /** Se emite cuando se actualizan los datos de un empleado existente. */
    EMPLEADO_ACTUALIZADO,

    /** Se emite cuando un empleado es dado de baja (soft-delete). */
    EMPLEADO_DESACTIVADO
}
