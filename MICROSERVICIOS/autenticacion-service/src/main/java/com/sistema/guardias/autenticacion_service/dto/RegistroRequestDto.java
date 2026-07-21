package com.sistema.guardias.autenticacion_service.dto;

import com.sistema.guardias.autenticacion_service.model.Rol;
import lombok.Data;

@Data
public class RegistroRequestDto {
    private String usuario;
    private String password;
    private Rol rolUsuario;
    
    // Datos de empleado
    private Long dni;
    private String nombre;
    private String apellido;
    private String email;
    private long telefono;
    private String direccion;
    private String rolEmpleado;
}
