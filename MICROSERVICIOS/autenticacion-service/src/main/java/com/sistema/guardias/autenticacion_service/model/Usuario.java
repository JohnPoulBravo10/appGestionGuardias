package com.sistema.guardias.autenticacion_service.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String usuario;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol;

    @Column(name = "empleado_dni", unique = true)
    private Long empleadoDni;

    /**
     * Indica si el usuario está activo en el sistema.
     * Al dar de baja al empleado asociado, se marca como false
     * para bloquear el acceso al sistema.
     */
    @Builder.Default
    @Column(nullable = false)
    private boolean activo = true;
}