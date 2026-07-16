
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
        return empleadoRepository.save(empleado);
    }

    public void eliminarEmpleado(Long dni) {
        empleadoRepository.deleteById(dni);
    }

    public List<Empleado> obtenerPorRol(Rol rol) {
        return empleadoRepository.findByRol(rol);
    }

    /**
     * Busca un empleado por su nombre de usuario.
     * Utilizado para la pantalla de login (validación básica).
     */
    public Optional<Empleado> buscarPorUsuario(String usuario) {
        return empleadoRepository.findByUsuario(usuario);
    }
}