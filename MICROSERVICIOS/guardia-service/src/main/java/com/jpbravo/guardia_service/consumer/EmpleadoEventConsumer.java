package com.jpbravo.guardia_service.consumer;

import com.jpbravo.guardia_service.event.EmpleadoEvent;
import com.jpbravo.guardia_service.event.TipoEmpleadoEvent;
import com.jpbravo.guardia_service.model.EstadoGuardia;
import com.jpbravo.guardia_service.model.Guardia;
import com.jpbravo.guardia_service.repository.GuardiaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * Consumidor Kafka que reacciona a eventos del ciclo de vida de empleados.
 * Al recibir EMPLEADO_DESACTIVADO, libera las guardias futuras del empleado
 * cambiándolas a estado ABIERTA y removiendo la asignación.
 */
@Service
public class EmpleadoEventConsumer {

    @Autowired
    private GuardiaRepository guardiaRepository;

    @KafkaListener(
            topics = "empleados-events",
            groupId = "guardia-service-empleado-group"
    )
    public void procesarEventoEmpleado(EmpleadoEvent evento) {

        if (evento.getTipoEvento() != TipoEmpleadoEvent.EMPLEADO_DESACTIVADO) {
            return;
        }

        System.out.println("[guardia-service] Empleado desactivado, DNI: " + evento.getEmpleadoDni()
                + ". Liberando guardias futuras...");

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

        System.out.println("[guardia-service] " + guardiasFuturas.size()
                + " guardias liberadas para DNI: " + evento.getEmpleadoDni());
    }
}
