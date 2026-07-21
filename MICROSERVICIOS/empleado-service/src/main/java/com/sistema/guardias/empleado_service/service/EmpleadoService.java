package com.sistema.guardias.empleado_service.service;

import com.sistema.guardias.empleado_service.model.Empleado;
import com.sistema.guardias.empleado_service.model.Rol;
import com.sistema.guardias.empleado_service.repository.EmpleadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmpleadoService {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    public List<Empleado> obtenerTodos() {
        return empleadoRepository.findAll();
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

    public void eliminarEmpleado(Long dni) {
        if (!empleadoRepository.existsById(dni)) {
            throw new RuntimeException("Empleado no encontrado");
        }

        empleadoRepository.deleteById(dni);
    }

    public List<Empleado> obtenerPorRol(Rol rol) {
        return empleadoRepository.findByRol(rol);
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