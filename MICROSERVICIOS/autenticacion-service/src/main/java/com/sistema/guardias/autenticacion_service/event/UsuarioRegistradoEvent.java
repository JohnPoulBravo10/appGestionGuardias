package com.sistema.guardias.autenticacion_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Evento Kafka publicado cuando se registra un nuevo usuario.
 * Contiene todos los datos de perfil necesarios para que empleado-service
 * cree el empleado asociado de forma asíncrona.
 *
 * <p>Se publica en el topic "usuario-registrado" con el DNI como key
 * para garantizar orden por partición.</p>
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
