
package com.jpbravo.guardia_service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

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
    private LocalDate fecha;

    
    @Column(nullable = false)
    private LocalTime horaInicio;

    
    @Column(nullable = false)
    private LocalTime horaFin;

    
    private Long empleadoId;

    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol;

    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoGuardia estado;
}
