package com.sistema.guardias.autenticacion_service.event;

/**
 * Tipos de eventos emitidos por empleado-service.
 * Espejo del enum original para deserialización de eventos Kafka.
 */
public enum TipoEmpleadoEvent {

    /** Se emite cuando un empleado es dado de baja (soft-delete). */
    EMPLEADO_DESACTIVADO
}
