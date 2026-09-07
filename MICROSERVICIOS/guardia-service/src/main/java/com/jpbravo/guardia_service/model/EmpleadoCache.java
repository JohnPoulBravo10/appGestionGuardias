package com.jpbravo.guardia_service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Caché local de datos de empleados, sincronizada mediante eventos Kafka.
 *
 * <p>Esta tabla permite resolver información del empleado (nombre, apellido, rol)
 * sin realizar llamadas HTTP síncronas a empleado-service, eliminando el
 * acoplamiento temporal entre microservicios.</p>
 *
 * <p>Se actualiza reactivamente al recibir eventos
 * {@code EMPLEADO_CREADO}, {@code EMPLEADO_ACTUALIZADO} y {@code EMPLEADO_DESACTIVADO}.</p>
 */
@Entity
@Table(name = "empleados_cache")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmpleadoCache {

    /** DNI del empleado, clave primaria (coincide con la PK en empleado-service). */
    @Id
    @Column(nullable = false)
    private Long dni;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    /** Rol almacenado como String para desacoplar del enum de empleado-service. */
    private String rol;

    /** Indica si el empleado está activo (false = baja lógica). */
    @Builder.Default
    @Column(nullable = false)
    private boolean activo = true;

    /** Timestamp del último evento procesado para esta entrada. */
    @Column(nullable = false)
    private LocalDateTime ultimaActualizacion;
}
