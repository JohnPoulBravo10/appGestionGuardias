package com.sistema.guardias.autenticacion_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/* Evento Kafka publicado cuando se registra un nuevo usuario.
   Contiene todos los datos de perfil necesarios para que empleado-service
   cree el empleado asociado de forma asíncrona.
   Se publica en el topic "usuario-registrado" con el DNI como key
   para garantizar orden por partición. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioRegistradoEvent {

    private Long dni;

    private String nombre;

    private String apellido;

    private String email;

    private long telefono;

    private String direccion;

    private String rol;

    private Long usuarioId;

    private LocalDateTime fechaEvento;
}
