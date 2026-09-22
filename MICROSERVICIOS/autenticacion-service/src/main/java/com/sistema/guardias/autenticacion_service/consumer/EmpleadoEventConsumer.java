package com.sistema.guardias.autenticacion_service.consumer;

import com.sistema.guardias.autenticacion_service.event.EmpleadoEvent;
import com.sistema.guardias.autenticacion_service.event.TipoEmpleadoEvent;
import com.sistema.guardias.autenticacion_service.model.Usuario;
import com.sistema.guardias.autenticacion_service.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;

import java.util.Optional;

/* Consumidor Kafka que reacciona a eventos del ciclo de vida de empleados.
   Al recibir EMPLEADO_DESACTIVADO, marca al usuario asociado como inactivo
   para bloquear su acceso al sistema (Spring Security rechazará el login). */
@Service
@Slf4j
public class EmpleadoEventConsumer {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @KafkaListener(
            topics = "empleados-events",
            groupId = "autenticacion-service-empleado-group"
    )
    @Retry(name = "consumerRetry", fallbackMethod = "fallbackProcesamiento")
    @CircuitBreaker(name = "consumerCB", fallbackMethod = "fallbackProcesamiento")
    public void procesarEventoEmpleado(EmpleadoEvent evento) {

        if (evento.getTipoEvento() != TipoEmpleadoEvent.EMPLEADO_DESACTIVADO) {
            return;
        }

        log.info("[autenticacion-service] Empleado desactivado, DNI: {}. Dando de baja al usuario asociado...", evento.getEmpleadoDni());

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmpleadoDni(evento.getEmpleadoDni());

        if (usuarioOpt.isEmpty()) {
            log.error("[autenticacion-service] No se encontró usuario asociado al DNI: {}", evento.getEmpleadoDni());
            return;
        }

        Usuario usuario = usuarioOpt.get();
        usuario.setActivo(false);
        usuarioRepository.save(usuario);

        log.info("[autenticacion-service] Usuario '{}' dado de baja exitosamente.", usuario.getUsuario());
    }

    public void fallbackProcesamiento(EmpleadoEvent evento, Exception e) {
        log.error("Error definitivo al procesar evento de empleado en autenticacion-service. Evento: {}, Error: {}", evento, e.getMessage());
        // Se registra la falla tras agotar reintentos para evitar un Poison Pill y avanzar el offset
    }
}
