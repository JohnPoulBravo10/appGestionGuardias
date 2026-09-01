package com.sistema.guardias.empleado_service.service;

import com.sistema.guardias.empleado_service.event.EmpleadoEvent;
import com.sistema.guardias.empleado_service.event.TipoEmpleadoEvent;
import com.sistema.guardias.empleado_service.model.Empleado;
import com.sistema.guardias.empleado_service.model.Rol;
import com.sistema.guardias.empleado_service.producer.EmpleadoEventProducer;
import com.sistema.guardias.empleado_service.repository.EmpleadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EmpleadoService {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private EmpleadoEventProducer empleadoEventProducer;

    /**
     * Obtiene todos los empleados activos del sistema.
     * Los empleados dados de baja (activo = false) quedan excluidos.
     */
    public List<Empleado> obtenerTodos() {
        return empleadoRepository.findByActivoTrue();
    }

    public Optional<Empleado> obtenerPorId(Long dni) {
        return empleadoRepository.findById(dni);
    }

    public Empleado guardarEmpleado(Empleado empleado) {
        if (empleadoRepository.existsById(empleado.getDni())) {
            throw new RuntimeException("Ya existe un empleado con ese DNI");
        }

        return empleadoRepository.save(empleado);
    }

    /**
     * Da de baja lógica a un empleado (soft-delete).
     * En lugar de eliminar el registro, marca el campo activo como false
     * y publica un evento Kafka para que los demás servicios reaccionen.
     *
     * @param dni DNI del empleado a desactivar
     * @throws RuntimeException si el empleado no existe
     */
    public void desactivarEmpleado(Long dni) {
        Empleado empleado = empleadoRepository.findById(dni)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        empleado.setActivo(false);
        empleadoRepository.save(empleado);

        // Publicar evento Kafka para notificar a los demás microservicios
        EmpleadoEvent evento = EmpleadoEvent.builder()
                .tipoEvento(TipoEmpleadoEvent.EMPLEADO_DESACTIVADO)
                .empleadoDni(dni)
                .fechaEvento(LocalDateTime.now())
                .build();

        empleadoEventProducer.publicarEvento(evento);
    }

    /**
     * Obtiene empleados activos filtrados por rol.
     */
    public List<Empleado> obtenerPorRol(Rol rol) {
        return empleadoRepository.findByRolAndActivoTrue(rol);
    }

    public Optional<Empleado> buscarPorUsuarioId(Long usuarioId) {
        return empleadoRepository.findByUsuarioId(usuarioId);
    }

    public Empleado actualizarEmpleado(Long dni, Empleado empleado) {
        if (!empleadoRepository.existsById(dni)) {
            throw new RuntimeException("Empleado no encontrado");
        }

        empleado.setDni(dni);

        return empleadoRepository.save(empleado);
    }
}