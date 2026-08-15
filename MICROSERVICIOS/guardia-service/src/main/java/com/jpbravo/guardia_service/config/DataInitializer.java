package com.jpbravo.guardia_service.config;

import com.jpbravo.guardia_service.model.EstadoGuardia;
import com.jpbravo.guardia_service.model.Guardia;
import com.jpbravo.guardia_service.model.Rol;
import com.jpbravo.guardia_service.repository.GuardiaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Inicializador de datos de prueba para el servicio de guardias.
 * Crea 4 guardias realistas basadas en la fecha actual:
 * - 1 guardia para hoy (turno de 12 horas).
 * - 2 guardias para mañana (turnos de 8 horas, roles distintos).
 * - 1 guardia para pasado mañana (turno de 12 horas, rol distinto).
 * Todas sin empleado asignado y en estado ABIERTA.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final GuardiaRepository guardiaRepository;

    @Override
    public void run(String... args) {
        /*
         * Se eliminan las guardias previas para garantizar que los datos
         * de prueba siempre reflejen la definición actual del código,
         * independientemente de reinicios con una BD persistente (MySQL).
         */
        guardiaRepository.deleteAll();
        log.info("Datos previos eliminados. Insertando guardias de prueba…");

        final LocalDate manana = LocalDate.now().plusDays(1);
        final LocalDate pasadoManana = LocalDate.now().plusDays(2);

        // Guardia 1 — Mañana, turno mañana 06:00–14:00, rol ENFERMERIA
        final Guardia guardiaMananaTurnoManana = Guardia.builder()
                .fecha(manana)
                .horaInicio(LocalTime.of(6, 0))
                .horaFin(LocalTime.of(14, 0))
                .empleadoId(null)
                .rol(Rol.MANTENIMIENTO)
                .estado(EstadoGuardia.ABIERTA)
                .build();

        // Guardia 2 — Mañana, turno tarde 14:00–22:00, rol LIMPIEZA
        final Guardia guardiaMananaTurnoTarde = Guardia.builder()
                .fecha(manana)
                .horaInicio(LocalTime.of(14, 0))
                .horaFin(LocalTime.of(22, 0))
                .empleadoId(null)
                .rol(Rol.LIMPIEZA)
                .estado(EstadoGuardia.ABIERTA)
                .build();

        // Guardia 3 — Pasado mañana, turno de 12 horas 08:00–20:00, rol MANTENIMIENTO
        final Guardia guardiaPasadoManana = Guardia.builder()
                .fecha(pasadoManana)
                .horaInicio(LocalTime.of(8, 0))
                .horaFin(LocalTime.of(20, 0))
                .empleadoId(null)
                .rol(Rol.ENFERMERIA)
                .estado(EstadoGuardia.ABIERTA)
                .build();

        // Guardia 4 — Hoy, turno de 12 horas 10:00–22:00, rol ENFERMERIA
        final Guardia guardiaHoy = Guardia.builder()
                .fecha(LocalDate.now())
                .horaInicio(LocalTime.of(10, 0))
                .horaFin(LocalTime.of(22, 0))
                .empleadoId(null)
                .rol(Rol.ENFERMERIA)
                .estado(EstadoGuardia.ABIERTA)
                .build();

        final List<Guardia> guardias = List.of(
                guardiaMananaTurnoManana,
                guardiaMananaTurnoTarde,
                guardiaPasadoManana,
                guardiaHoy
        );

        guardiaRepository.saveAll(guardias);
        log.info("Se inicializaron {} guardias de prueba", guardias.size());
    }
}
