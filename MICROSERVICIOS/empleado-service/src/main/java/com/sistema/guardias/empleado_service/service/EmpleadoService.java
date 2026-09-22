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

    // Obtiene todos los empleados activos del sistema.
    public List<Empleado> obtenerTodos() {
        return empleadoRepository.findByActivoTrue();
    }

    // Obtiene un empleado por su DNI.
    public Optional<Empleado> obtenerPorId(Long dni) {
        return empleadoRepository.findById(dni);
    }

    // Crea un nuevo empleado.
    public Empleado guardarEmpleado(Empleado empleado) {
        if (empleadoRepository.existsById(empleado.getDni())) {
            throw new RuntimeException("Ya existe un empleado con ese DNI");
        }

        Empleado guardado = empleadoRepository.save(empleado);

        empleadoEventProducer.publicarEvento(
                construirEvento(TipoEmpleadoEvent.EMPLEADO_CREADO, guardado));

        return guardado;
    }

    // Desactiva un empleado (soft-delete).
    public void desactivarEmpleado(Long dni) {
        Empleado empleado = empleadoRepository.findById(dni)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        if (Rol.ADMINISTRADOR.equals(empleado.getRol())) {
            throw new IllegalArgumentException("No está permitido dar de baja a un administrador.");
        }

        empleado.setActivo(false);
        empleadoRepository.save(empleado);

        empleadoEventProducer.publicarEvento(
                construirEvento(TipoEmpleadoEvent.EMPLEADO_DESACTIVADO, empleado));
    }

    // Obtiene empleados activos filtrados por rol.
    public List<Empleado> obtenerPorRol(Rol rol) {
        return empleadoRepository.findByRolAndActivoTrue(rol);
    }

    // Obtiene un empleado por su usuarioId.
    public Optional<Empleado> buscarPorUsuarioId(Long usuarioId) {
        return empleadoRepository.findByUsuarioId(usuarioId);
    }

    // Actualiza un empleado.
    public Empleado actualizarEmpleado(Long dni, Empleado empleado) {
        if (!empleadoRepository.existsById(dni)) {
            throw new RuntimeException("Empleado no encontrado");
        }

        empleado.setDni(dni);

        Empleado actualizado = empleadoRepository.save(empleado);

        empleadoEventProducer.publicarEvento(
                construirEvento(TipoEmpleadoEvent.EMPLEADO_ACTUALIZADO, actualizado));

        return actualizado;
    }

    // Construye un evento a partir de la entidad Empleado.
    private EmpleadoEvent construirEvento(TipoEmpleadoEvent tipo, Empleado empleado) {
        return EmpleadoEvent.builder()
                .tipoEvento(tipo)
                .empleadoDni(empleado.getDni())
                .nombre(empleado.getNombre())
                .apellido(empleado.getApellido())
                .rol(empleado.getRol() != null ? empleado.getRol().name() : null)
                .fechaEvento(LocalDateTime.now())
                .build();
    }
}