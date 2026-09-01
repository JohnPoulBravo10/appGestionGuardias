package com.sistema.guardias.autenticacion_service.consumer;

import com.sistema.guardias.autenticacion_service.event.EmpleadoEvent;
import com.sistema.guardias.autenticacion_service.event.TipoEmpleadoEvent;
import com.sistema.guardias.autenticacion_service.model.Usuario;
import com.sistema.guardias.autenticacion_service.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Consumidor Kafka que reacciona a eventos del ciclo de vida de empleados.
 * Al recibir EMPLEADO_DESACTIVADO, marca al usuario asociado como inactivo
 * para bloquear su acceso al sistema (Spring Security rechazará el login).
 */
@Service
public class EmpleadoEventConsumer {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @KafkaListener(
            topics = "empleados-events",
            groupId = "autenticacion-service-empleado-group"
    )
    public void procesarEventoEmpleado(EmpleadoEvent evento) {

        if (evento.getTipoEvento() != TipoEmpleadoEvent.EMPLEADO_DESACTIVADO) {
            return;
        }

        System.out.println("[autenticacion-service] Empleado desactivado, DNI: " + evento.getEmpleadoDni()
                + ". Dando de baja al usuario asociado...");

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmpleadoDni(evento.getEmpleadoDni());

        if (usuarioOpt.isEmpty()) {
            System.err.println("[autenticacion-service] No se encontró usuario asociado al DNI: "
                    + evento.getEmpleadoDni());
            return;
        }

        Usuario usuario = usuarioOpt.get();
        usuario.setActivo(false);
        usuarioRepository.save(usuario);

        System.out.println("[autenticacion-service] Usuario '" + usuario.getUsuario()
                + "' dado de baja exitosamente.");
    }
}
