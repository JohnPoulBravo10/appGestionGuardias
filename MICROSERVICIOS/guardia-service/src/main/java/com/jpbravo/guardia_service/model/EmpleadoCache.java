package com.jpbravo.guardia_service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/* Caché local de datos de empleados, sincronizada mediante eventos Kafka.
   Esta tabla permite resolver información del empleado (nombre, apellido, rol)
   sin realizar llamadas HTTP síncronas a empleado-service, eliminando el
   acoplamiento temporal entre microservicios.
   Se actualiza reactivamente al recibir eventos
   EMPLEADO_CREADO, EMPLEADO_ACTUALIZADO y EMPLEADO_DESACTIVADO. */
@Entity
@Table(name = "empleados_cache")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmpleadoCache {

    @Id
    @Column(nullable = false)
    private Long dni;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    private String rol;

    @Builder.Default
    @Column(nullable = false)
    private boolean activo = true;

    @Column(nullable = false)
    private LocalDateTime ultimaActualizacion;
}
