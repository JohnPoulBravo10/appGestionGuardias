package com.sistema.guardias.empleado_service.consumer;

import com.sistema.guardias.empleado_service.event.UsuarioRegistradoEvent;
import com.sistema.guardias.empleado_service.model.Empleado;
import com.sistema.guardias.empleado_service.model.Rol;
import com.sistema.guardias.empleado_service.service.EmpleadoService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

/**
 * Consumidor Kafka que reacciona al evento de registro de usuario
 * emitido por autenticacion-service.
 *
 * <p>Al recibir un {@link UsuarioRegistradoEvent}, construye un {@link Empleado}
 * y lo persiste en la base de datos. La operación es idempotente: si el empleado
 * ya existe (por DNI duplicado), se loguea el conflicto sin propagar la excepción
 * para evitar reintentos infinitos del consumer.</p>
 */
@Service
public class UsuarioRegistradoConsumer {

    private static final Logger log = LoggerFactory.getLogger(UsuarioRegistradoConsumer.class);

    private final EmpleadoService empleadoService;

    public UsuarioRegistradoConsumer(EmpleadoService empleadoService) {
        this.empleadoService = empleadoService;
    }

    @KafkaListener(
            topics = "usuario-registrado",
            groupId = "empleado-service-usuario-group",
            properties = {
                "spring.json.value.default.type=com.sistema.guardias.empleado_service.event.UsuarioRegistradoEvent"
            }
    )
    public void procesarUsuarioRegistrado(UsuarioRegistradoEvent evento) {
        log.info("Evento recibido: registro de usuario con DNI {} (usuarioId={})",
                evento.getDni(), evento.getUsuarioId());

        try {
            Empleado empleado = Empleado.builder()
                    .dni(evento.getDni())
                    .nombre(evento.getNombre())
                    .apellido(evento.getApellido())
                    .email(evento.getEmail())
                    .telefono(evento.getTelefono())
                    .direccion(evento.getDireccion())
                    .rol(Rol.valueOf(evento.getRol()))
                    .usuarioId(evento.getUsuarioId())
                    .build();

            empleadoService.guardarEmpleado(empleado);

            log.info("Empleado con DNI {} creado exitosamente desde evento Kafka.", evento.getDni());

        } catch (RuntimeException ex) {
            // Idempotencia: si el empleado ya existe, loguear sin relanzar para que
            // Kafka no reintente indefinidamente un mensaje que siempre fallará.
            log.warn("No se pudo crear el empleado con DNI {} desde evento Kafka: {}",
                    evento.getDni(), ex.getMessage());
        }
    }
}
