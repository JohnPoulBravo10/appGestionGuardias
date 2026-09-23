
package com.sistema.guardias.empleado_service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "empleados")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Empleado {

        @Id
        @Column(unique = true, nullable = false)
        @NotNull(message = "El DNI es obligatorio")
        @Min(value = 1000000, message = "DNI argentino: entre 7 y 8 dígitos")
        @Max(value = 99999999, message = "DNI argentino: entre 7 y 8 dígitos")
        private Long dni;

        @Column(nullable = false)
        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 2, max = 50, message = "Entre 2 y 50 caracteres")
        @Pattern(regexp = "^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\\s]+$", message = "Solo se permiten letras")
        private String nombre;

        @Column(nullable = false)
        @NotBlank(message = "El apellido es obligatorio")
        @Size(min = 2, max = 50, message = "Entre 2 y 50 caracteres")
        @Pattern(regexp = "^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\\s]+$", message = "Solo se permiten letras")
        private String apellido;

        @Enumerated(EnumType.STRING)
        private Rol rol;

        @NotBlank(message = "El email es obligatorio")
        @Size(max = 50, message = "Máximo 50 caracteres")
        @Email(message = "Formato de email inválido")
        private String email;

        private long telefono;

        @Size(max = 100, message = "Máximo 100 caracteres")
        private String direccion;

        @Column(name = "usuario_id", nullable = false)
        private Long usuarioId;

        @Builder.Default
        @Column(nullable = false)
        private boolean activo = true;

}
