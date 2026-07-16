
package com.sistema.guardias.empleado_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "empleados") // Buena práctica: definir nombre de tabla explícito
@Data // Genera getters, setters, toString, equals y hashCode
@NoArgsConstructor // Constructor vacío requerido por JPA
@AllArgsConstructor // Constructor con todos los campos
@Builder // Patrón builder para crear objetos fácilmente
public class Empleado {

    @Id
    @Column(unique = true, nullable = false)
    private Long dni;
    
    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @Enumerated(EnumType.STRING) // Guarda el nombre del rol en la BD (ej: "Enfermeria")
    private Rol rol;

    private String email;
    
    private long telefono;
    
    private String direccion;

    @Column(unique = true, nullable = false)
    private String usuario;

    @Column(nullable = false)
    private String password;
    

}
