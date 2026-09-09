package com.jpbravo.guardia_service.service;

import com.jpbravo.guardia_service.event.GuardiaEvent;
import com.jpbravo.guardia_service.event.TipoGuardiaEvent;
import com.jpbravo.guardia_service.model.EstadoGuardia;
import com.jpbravo.guardia_service.model.Guardia;
import com.jpbravo.guardia_service.producer.GuardiaEventProducer;
import com.jpbravo.guardia_service.repository.GuardiaRepository;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Component
@RequiredArgsConstructor
@Slf4j
public class GuardiaStatusProcessor {

    private final GuardiaRepository guardiaRepository;
    private final GuardiaEventProducer eventProducer;

    @Async
    @TimeLimiter(name = "schedulerLimiter")
    @Retry(name = "schedulerRetry")
    public CompletableFuture<Void> procesarActualizacionDeEstados() {
        return CompletableFuture.supplyAsync(() -> {
            List<Guardia> guardiasPendientes = guardiaRepository.findByEstadoNot(EstadoGuardia.COMPLETADA);
            LocalDateTime now = LocalDateTime.now();

            for (Guardia guardia : guardiasPendientes) {
                LocalDateTime inicio = LocalDateTime.of(guardia.getFecha(), guardia.getHoraInicio());
                LocalDateTime fin = LocalDateTime.of(guardia.getFecha(), guardia.getHoraFin());

                // Lógica para guardias nocturnas (que atraviesan la medianoche)
                if (guardia.getHoraInicio().isAfter(guardia.getHoraFin())) {
                    fin = fin.plusDays(1);
                }

                EstadoGuardia estadoAnterior = guardia.getEstado();
                EstadoGuardia nuevoEstado = estadoAnterior;

                if (now.isAfter(fin) || now.isEqual(fin)) {
                    nuevoEstado = EstadoGuardia.COMPLETADA;
                } else if ((now.isAfter(inicio) || now.isEqual(inicio)) && now.isBefore(fin)) {
                    nuevoEstado = EstadoGuardia.ENCURSO;
                }

                if (estadoAnterior != nuevoEstado) {
                    guardia.setEstado(nuevoEstado);
                    guardiaRepository.save(guardia);
                    log.info("Guardia ID {} actualizada de {} a {}", guardia.getId(), estadoAnterior, nuevoEstado);

                    emitirEventoSiCorresponde(guardia, nuevoEstado);
                }
            }
            return null;
        });
    }

    private void emitirEventoSiCorresponde(Guardia guardia, EstadoGuardia nuevoEstado) {
        TipoGuardiaEvent tipoEvento = null;

        if (nuevoEstado == EstadoGuardia.ENCURSO) {
            tipoEvento = TipoGuardiaEvent.GUARDIA_COMENZADA;
        } else if (nuevoEstado == EstadoGuardia.COMPLETADA) {
            tipoEvento = TipoGuardiaEvent.GUARDIA_TERMINADA;
        }

        if (tipoEvento != null) {
            GuardiaEvent evento = GuardiaEvent.builder()
                    .tipoEvento(tipoEvento)
                    .guardiaId(guardia.getId())
                    .empleadoId(guardia.getEmpleadoId()) // Puede ser null si estaba ABIERTA
                    .fecha(guardia.getFecha())
                    .horaInicio(guardia.getHoraInicio())
                    .horaFin(guardia.getHoraFin())
                    .rol(guardia.getRol())
                    .fechaEvento(LocalDateTime.now())
                    .build();

            eventProducer.publicarEvento(evento);
            log.info("Evento {} publicado para Guardia ID {}", tipoEvento, guardia.getId());
        }
    }
}
