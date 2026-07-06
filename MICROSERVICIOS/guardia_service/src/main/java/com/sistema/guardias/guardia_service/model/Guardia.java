
package com.sistema.guardias.guardia_service.model;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "guardias")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guardia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime fechaInicio;

    @Column(nullable = false)
    private LocalDateTime fechaFin;

    @Column(nullable = false)
    private Long empleadoId; // Relación lógica con el microservicio de empleados

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoGuardia estado; // PROXIMA, EN_CURSO, COMPLETADA
}
