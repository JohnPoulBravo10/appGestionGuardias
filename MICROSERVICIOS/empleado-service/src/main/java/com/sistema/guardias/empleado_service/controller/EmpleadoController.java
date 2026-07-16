
package com.sistema.guardias.empleado_service.controller;


import com.sistema.guardias.empleado_service.model.Empleado;
import com.sistema.guardias.empleado_service.model.Rol;
import com.sistema.guardias.empleado_service.service.EmpleadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/empleados")
public class EmpleadoController {

    @Autowired
    private EmpleadoService empleadoService;

    @GetMapping
    public List<Empleado> listarEmpleados(
            @RequestParam(required = false) Rol rol) {

        if (rol != null) {
            return empleadoService.obtenerPorRol(rol);
        }

        return empleadoService.obtenerTodos();
    }

    @PostMapping
    public Empleado crearEmpleado(@RequestBody Empleado empleado) {
        return empleadoService.guardarEmpleado(empleado);
    }

    @GetMapping("/{dni}")
    public ResponseEntity<Empleado> obtenerEmpleado(@PathVariable Long dni) {
        return empleadoService.obtenerPorId(dni)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{dni}")
    public ResponseEntity<Void> eliminarEmpleado(@PathVariable Long dni) {
        empleadoService.eliminarEmpleado(dni);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint de login simplificado.
     * Busca al empleado por nombre de usuario y valida la contraseña
     * con comparación directa (sin hashing — MVP).
     */
    @GetMapping("/login")
    public ResponseEntity<Empleado> login(
            @RequestParam String usuario,
            @RequestParam String password) {

        Optional<Empleado> empleado = empleadoService.buscarPorUsuario(usuario);

        if (empleado.isPresent() && empleado.get().getPassword().equals(password)) {
            return ResponseEntity.ok(empleado.get());
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}