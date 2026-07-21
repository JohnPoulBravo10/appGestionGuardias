package com.sistema.guardias.autenticacion_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NuevoEmpleadoDto {
    private Long dni;
    private String nombre;
    private String apellido;
    private String email;
    private long telefono;
    private String direccion;
    // En el empleado, mantenemos el rol correspondiente a sus funciones, que se enviará como String
    private String rol;
    private Long usuarioId;
}
