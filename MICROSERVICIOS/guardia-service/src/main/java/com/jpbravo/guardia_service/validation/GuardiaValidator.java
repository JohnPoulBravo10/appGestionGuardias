package com.jpbravo.guardia_service.validation;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Validador de reglas de negocio para guardias.
 *
 * <p>Contiene validaciones que no se pueden expresar con anotaciones
 * Jakarta estándar, como la coherencia entre hora de inicio y fin
 * con soporte para guardias nocturnas, duración de la guardia,
 * y hora de inicio para guardias del día actual.</p>
 */
@Component
public class GuardiaValidator {

    /** Mediodía: divisor entre AM y PM */
    private static final LocalTime MEDIODIA =
            LocalTime.of(12, 0);

    /** Duración mínima de una guardia en horas */
    private static final long DURACION_MIN_HORAS = 4;

    /** Duración máxima de una guardia en horas */
    private static final long DURACION_MAX_HORAS = 12;

    /**
     * Valida todas las reglas de negocio de una guardia.
     *
     * <p>Incluye validación de coherencia de horario, duración
     * (mínimo 4h, máximo 12h) y hora de inicio para guardias de hoy.</p>
     *
     * @param fecha      fecha de la guardia
     * @param horaInicio hora de inicio de la guardia
     * @param horaFin    hora de fin de la guardia
     * @return mapa de errores { campo → mensaje } o mapa vacío si es válido
     */
    public Map<String, String> validar(
            LocalDate fecha,
            LocalTime horaInicio,
            LocalTime horaFin) {

        Map<String, String> errores = new HashMap<>();

        if (horaInicio == null || horaFin == null) {
            return errores;
        }

        /* ── Coherencia de horario ── */

        if (horaInicio.equals(horaFin)) {
            errores.put("horaFin",
                    "La hora de inicio y fin no pueden ser iguales");
            return errores;
        }

        /*
         * Guardia nocturna: inicio >= 12:00 (PM) y fin < 12:00 (AM).
         * Se asume que la guardia cruza la medianoche → es válido.
         */
        boolean esGuardiaNocturna =
                !horaInicio.isBefore(MEDIODIA) &&
                        horaFin.isBefore(MEDIODIA);

        if (!esGuardiaNocturna && horaInicio.isAfter(horaFin)) {
            errores.put("horaFin",
                    "La hora de fin debe ser posterior a la de inicio");
            return errores;
        }

        /* ── Duración mínima y máxima ── */

        long duracionMinutos = calcularDuracionMinutos(
                horaInicio, horaFin);

        if (duracionMinutos < DURACION_MIN_HORAS * 60) {
            errores.put("horaFin",
                    "La guardia debe durar al menos "
                            + DURACION_MIN_HORAS + " horas");
        }

        if (duracionMinutos > DURACION_MAX_HORAS * 60) {
            errores.put("horaFin",
                    "La guardia no puede durar más de "
                            + DURACION_MAX_HORAS + " horas");
        }

        /* ── Hora de inicio para guardias de hoy ── */

        if (fecha != null && fecha.equals(LocalDate.now())) {
            if (!horaInicio.isAfter(LocalTime.now())) {
                errores.put("horaInicio",
                        "Para guardias de hoy, la hora de inicio debe ser posterior a la hora actual");
            }
        }

        return errores;
    }

    /**
     * Calcula la duración en minutos entre dos horarios.
     * Soporta guardias nocturnas que cruzan la medianoche.
     */
    private long calcularDuracionMinutos(
            LocalTime horaInicio,
            LocalTime horaFin) {

        Duration duracion = Duration.between(horaInicio, horaFin);

        /* Si la duración es negativa, la guardia cruza la medianoche */
        if (duracion.isNegative()) {
            duracion = duracion.plusHours(24);
        }

        return duracion.toMinutes();
    }
}
