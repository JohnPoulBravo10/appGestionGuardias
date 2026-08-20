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
 * Crea 12 guardias distribuidas entre ayer, hoy, mañana y pasado mañana.
 * - Incluye un turno por cada rol (ENFERMERIA, LIMPIEZA, MANTENIMIENTO) por día.
 * - Las guardias de ayer están en estado COMPLETADA.
 * - Las demás están en estado ABIERTA.
 * - Todas se inician sin empleado asignado.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final GuardiaRepository guardiaRepository;

    private EstadoGuardia getEstadoHoy(LocalTime inicio, LocalTime fin) {
        LocalTime ahora = LocalTime.now();
        if (ahora.isAfter(fin) || ahora.equals(fin)) return EstadoGuardia.COMPLETADA;
        if (ahora.isBefore(inicio)) return EstadoGuardia.PROXIMA;
        return EstadoGuardia.ENCURSO;
    }

    @Override
    public void run(String... args) {
        /*
         * Se eliminan las guardias previas para garantizar que los datos
         * de prueba siempre reflejen la definición actual del código,
         * independientemente de reinicios con una BD persistente (MySQL).
         */
        guardiaRepository.deleteAll();
        log.info("Datos previos eliminados. Insertando guardias de prueba…");

        final LocalDate ayer = LocalDate.now().minusDays(1);
        final LocalDate hoy = LocalDate.now();
        final LocalDate manana = LocalDate.now().plusDays(1);
        final LocalDate pasadoManana = LocalDate.now().plusDays(2);

        // -- AYER --
        final Guardia gAyerEnfermeria = Guardia.builder().fecha(ayer)
                .horaInicio(LocalTime.of(6, 0)).horaFin(LocalTime.of(14, 0))
                .empleadoId(20000001L).rol(Rol.ENFERMERIA).estado(EstadoGuardia.COMPLETADA).build();
        final Guardia gAyerLimpieza = Guardia.builder().fecha(ayer)
                .horaInicio(LocalTime.of(14, 0)).horaFin(LocalTime.of(22, 0))
                .empleadoId(40000001L).rol(Rol.LIMPIEZA).estado(EstadoGuardia.COMPLETADA).build();
        final Guardia gAyerMantenimiento = Guardia.builder().fecha(ayer)
                .horaInicio(LocalTime.of(8, 0)).horaFin(LocalTime.of(20, 0))
                .empleadoId(30000001L).rol(Rol.MANTENIMIENTO).estado(EstadoGuardia.COMPLETADA).build();

        // -- HOY --
        final Guardia gHoyEnfermeria = Guardia.builder().fecha(hoy)
                .horaInicio(LocalTime.of(6, 0)).horaFin(LocalTime.of(14, 0))
                .empleadoId(20000001L).rol(Rol.ENFERMERIA).estado(getEstadoHoy(LocalTime.of(6, 0), LocalTime.of(14, 0))).build();
        final Guardia gHoyEnfermeria2 = Guardia.builder().fecha(hoy)
                .horaInicio(LocalTime.of(14, 0)).horaFin(LocalTime.of(22, 0))
                .empleadoId(20000001L).rol(Rol.ENFERMERIA).estado(getEstadoHoy(LocalTime.of(14, 0), LocalTime.of(22, 0))).build();
        final Guardia gHoyLimpieza = Guardia.builder().fecha(hoy)
                .horaInicio(LocalTime.of(6, 0)).horaFin(LocalTime.of(14, 0))
                .empleadoId(40000001L).rol(Rol.LIMPIEZA).estado(getEstadoHoy(LocalTime.of(6, 0), LocalTime.of(14, 0))).build();
        final Guardia gHoyLimpieza2 = Guardia.builder().fecha(hoy)
                .horaInicio(LocalTime.of(14, 0)).horaFin(LocalTime.of(22, 0))
                .empleadoId(40000001L).rol(Rol.LIMPIEZA).estado(getEstadoHoy(LocalTime.of(14, 0), LocalTime.of(22, 0))).build();
        final Guardia gHoyMantenimiento = Guardia.builder().fecha(hoy)
                .horaInicio(LocalTime.of(8, 0)).horaFin(LocalTime.of(16, 0))
                .empleadoId(30000001L).rol(Rol.MANTENIMIENTO).estado(getEstadoHoy(LocalTime.of(8, 0), LocalTime.of(16, 0))).build();
        final Guardia gHoyMantenimiento2 = Guardia.builder().fecha(hoy)
                .horaInicio(LocalTime.of(16, 0)).horaFin(LocalTime.of(22, 0))
                .empleadoId(30000001L).rol(Rol.MANTENIMIENTO).estado(getEstadoHoy(LocalTime.of(16, 0), LocalTime.of(22, 0))).build();

        // -- MAÑANA --
        final Guardia gMananaEnfermeria = Guardia.builder().fecha(manana)
                .horaInicio(LocalTime.of(6, 0)).horaFin(LocalTime.of(14, 0))
                .empleadoId(20000001L).rol(Rol.ENFERMERIA).estado(EstadoGuardia.PROXIMA).build();
        final Guardia gMananaLimpieza = Guardia.builder().fecha(manana)
                .horaInicio(LocalTime.of(14, 0)).horaFin(LocalTime.of(22, 0))
                .empleadoId(40000001L).rol(Rol.LIMPIEZA).estado(EstadoGuardia.PROXIMA).build();
        final Guardia gMananaMantenimiento = Guardia.builder().fecha(manana)
                .horaInicio(LocalTime.of(8, 0)).horaFin(LocalTime.of(20, 0))
                .empleadoId(30000001L).rol(Rol.MANTENIMIENTO).estado(EstadoGuardia.PROXIMA).build();

        // -- PASADO MAÑANA --
        final Guardia gPasadoEnfermeria = Guardia.builder().fecha(pasadoManana)
                .horaInicio(LocalTime.of(10, 0)).horaFin(LocalTime.of(22, 0))
                .empleadoId(null).rol(Rol.ENFERMERIA).estado(EstadoGuardia.ABIERTA).build();
        final Guardia gPasadoLimpieza = Guardia.builder().fecha(pasadoManana)
                .horaInicio(LocalTime.of(6, 0)).horaFin(LocalTime.of(14, 0))
                .empleadoId(null).rol(Rol.LIMPIEZA).estado(EstadoGuardia.ABIERTA).build();
        final Guardia gPasadoMantenimiento = Guardia.builder().fecha(pasadoManana)
                .horaInicio(LocalTime.of(14, 0)).horaFin(LocalTime.of(22, 0))
                .empleadoId(null).rol(Rol.MANTENIMIENTO).estado(EstadoGuardia.ABIERTA).build();

        final List<Guardia> guardias = List.of(
                gAyerEnfermeria, gAyerLimpieza, gAyerMantenimiento,
                gHoyEnfermeria, gHoyLimpieza, gHoyMantenimiento,
                gHoyEnfermeria2, gHoyLimpieza2, gHoyMantenimiento2,
                gMananaEnfermeria, gMananaLimpieza, gMananaMantenimiento,
                gPasadoEnfermeria, gPasadoLimpieza, gPasadoMantenimiento
        );

        guardiaRepository.saveAll(guardias);
        log.info("Se inicializaron {} guardias de prueba", guardias.size());
    }
}
