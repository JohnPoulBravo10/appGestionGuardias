package com.jpbravo.notification_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

// DTO que representa un evento de guardia recibido desde Kafka.
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuardiaEvent {

    private TipoGuardiaEvent tipoEvento;

    private Long guardiaId;

    private Long empleadoId;

    private LocalDate fecha;

    private LocalTime horaInicio;

    private LocalTime horaFin;

    private String rol;

    private LocalDateTime fechaEvento;
}