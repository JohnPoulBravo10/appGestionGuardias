package com.jpbravo.guardia_service.consumer;

import com.jpbravo.guardia_service.event.EmpleadoEvent;
import com.jpbravo.guardia_service.event.TipoEmpleadoEvent;
import com.jpbravo.guardia_service.model.EmpleadoCache;
import com.jpbravo.guardia_service.model.EstadoGuardia;
import com.jpbravo.guardia_service.model.Guardia;
import com.jpbravo.guardia_service.repository.EmpleadoCacheRepository;
import com.jpbravo.guardia_service.repository.GuardiaRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Consumidor Kafka que reacciona a eventos del ciclo de vida de empleados.
 *
 * <p>Responsabilidades:</p>
 * <ul>
 *   <li>{@code EMPLEADO_CREADO} / {@code EMPLEADO_ACTUALIZADO}: sincroniza la
 *       caché local {@code empleados_cache} con los datos del empleado.</li>
 *   <li>{@code EMPLEADO_DESACTIVADO}: marca al empleado como inactivo en la
 *       caché y libera las guardias futuras asignadas a ese empleado.</li>
 * </ul>
 */
@Service
public class EmpleadoEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(EmpleadoEventConsumer.class);

    private final EmpleadoCacheRepository empleadoCacheRepository;
    private final GuardiaRepository guardiaRepository;

    public EmpleadoEventConsumer(
            EmpleadoCacheRepository empleadoCacheRepository,
            GuardiaRepository guardiaRepository
    ) {
        this.empleadoCacheRepository = empleadoCacheRepository;
        this.guardiaRepository = guardiaRepository;
    }

    @KafkaListener(
            topics = "empleados-events",
            groupId = "guardia-service-empleado-group",
            properties = {
                "spring.json.value.default.type=com.jpbravo.guardia_service.event.EmpleadoEvent"
            }
    )
    public void procesarEventoEmpleado(EmpleadoEvent evento) {

        if (evento.getTipoEvento() == null) {
            log.warn("Evento de empleado recibido sin tipo, ignorando. DNI: {}", evento.getEmpleadoDni());
            return;
        }

        switch (evento.getTipoEvento()) {
            case EMPLEADO_CREADO, EMPLEADO_ACTUALIZADO -> actualizarCache(evento);
            case EMPLEADO_DESACTIVADO -> procesarDesactivacion(evento);
        }
    }

    /**
     * Inserta o actualiza la caché local con los datos del empleado
     * recibidos en el evento Kafka.
     */
    private void actualizarCache(EmpleadoEvent evento) {

        EmpleadoCache cache = empleadoCacheRepository.findById(evento.getEmpleadoDni())
                .orElse(EmpleadoCache.builder()
                        .dni(evento.getEmpleadoDni())
                        .build()
                );

        cache.setNombre(evento.getNombre());
        cache.setApellido(evento.getApellido());
        cache.setRol(evento.getRol());
        cache.setActivo(true);
        cache.setUltimaActualizacion(LocalDateTime.now());

        empleadoCacheRepository.save(cache);

        log.info("[guardia-service] Caché actualizada para empleado DNI: {} ({})",
                evento.getEmpleadoDni(), evento.getTipoEvento());
    }

    /**
     * Marca al empleado como inactivo en la caché y libera todas sus
     * guardias futuras con estado PROXIMA, cambiándolas a ABIERTA.
     */
    private void procesarDesactivacion(EmpleadoEvent evento) {

        // Actualizar caché marcando como inactivo
        empleadoCacheRepository.findById(evento.getEmpleadoDni())
                .ifPresent(cache -> {
                    cache.setActivo(false);
                    cache.setUltimaActualizacion(LocalDateTime.now());
                    empleadoCacheRepository.save(cache);
                });

        log.info("[guardia-service] Empleado desactivado, DNI: {}. Liberando guardias futuras...",
                evento.getEmpleadoDni());

        // Liberar guardias futuras (lógica existente preservada)
        List<Guardia> guardiasFuturas = guardiaRepository
                .findByEmpleadoIdAndFechaGreaterThanEqualAndEstado(
                        evento.getEmpleadoDni(),
                        LocalDate.now(),
                        EstadoGuardia.PROXIMA
                );

        for (Guardia guardia : guardiasFuturas) {
            guardia.setEmpleadoId(null);
            guardia.setEstado(EstadoGuardia.ABIERTA);
        }

        guardiaRepository.saveAll(guardiasFuturas);

        log.info("[guardia-service] {} guardias liberadas para DNI: {}",
                guardiasFuturas.size(), evento.getEmpleadoDni());
    }
}
