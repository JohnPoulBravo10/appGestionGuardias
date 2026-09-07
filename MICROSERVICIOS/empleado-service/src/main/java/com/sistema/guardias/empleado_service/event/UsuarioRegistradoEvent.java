package com.sistema.guardias.empleado_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO espejo del evento emitido por autenticacion-service al registrar un usuario.
 * Permite la deserialización de eventos Kafka del topic "usuario-registrado".
 *
 * <p>Contiene todos los datos de perfil necesarios para crear un {@link com.sistema.guardias.empleado_service.model.Empleado}.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioRegistradoEvent {

    /** DNI del nuevo empleado. */
    private Long dni;

    /** Nombre del empleado. */
    private String nombre;

    /** Apellido del empleado. */
    private String apellido;

    /** Email de contacto. */
    private String email;

    /** Teléfono de contacto. */
    private long telefono;

    /** Dirección postal. */
    private String direccion;

    /** Rol funcional del empleado (ej: ENFERMERIA, MANTENIMIENTO). */
    private String rol;

    /** ID del usuario en autenticacion-service, para vincular ambas entidades. */
    private Long usuarioId;

    /** Fecha y hora en que se produjo el registro. */
    private LocalDateTime fechaEvento;
}
