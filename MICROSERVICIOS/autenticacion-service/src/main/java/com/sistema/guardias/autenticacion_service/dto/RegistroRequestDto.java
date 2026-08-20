package com.sistema.guardias.autenticacion_service.dto;

import com.sistema.guardias.autenticacion_service.model.Rol;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegistroRequestDto {

    @NotBlank(message = "El usuario es obligatorio")
    @Size(min = 4, max = 20, message = "Entre 4 y 20 caracteres")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$",
            message = "Solo letras, números y guión bajo (_)")
    private String usuario;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 30, message = "Entre 6 y 30 caracteres")
    @Pattern(regexp = "^(?=.*[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])(?=.*\\d).+$",
            message = "Debe incluir al menos una letra y un número")
    private String password;

    @NotNull(message = "El rol de usuario es obligatorio")
    private Rol rolUsuario;

    // Datos de empleado

    @NotNull(message = "El DNI es obligatorio")
    @Min(value = 1000000, message = "DNI argentino: entre 7 y 8 dígitos")
    @Max(value = 99999999, message = "DNI argentino: entre 7 y 8 dígitos")
    private Long dni;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 50, message = "Entre 2 y 50 caracteres")
    @Pattern(regexp = "^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\\s]+$",
            message = "Solo se permiten letras")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(min = 2, max = 50, message = "Entre 2 y 50 caracteres")
    @Pattern(regexp = "^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\\s]+$",
            message = "Solo se permiten letras")
    private String apellido;

    @NotBlank(message = "El email es obligatorio")
    @Size(max = 50, message = "Máximo 50 caracteres")
    @Email(message = "Formato de email inválido")
    private String email;

    @Min(value = 1000000, message = "Teléfono: entre 7 y 15 dígitos")
    private long telefono;

    @Size(max = 100, message = "Máximo 100 caracteres")
    private String direccion;

    @NotBlank(message = "El rol del empleado es obligatorio")
    private String rolEmpleado;
}
