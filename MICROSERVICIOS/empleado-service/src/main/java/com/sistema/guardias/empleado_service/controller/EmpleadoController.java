package com.sistema.guardias.empleado_service.controller;

import com.sistema.guardias.empleado_service.model.Empleado;
import com.sistema.guardias.empleado_service.model.Rol;
import com.sistema.guardias.empleado_service.service.EmpleadoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<?> crearEmpleado(@RequestBody Empleado empleado) {

        try {

            Empleado nuevo = empleadoService.guardarEmpleado(empleado);

            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());

        }

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

    @PutMapping("/{dni}")
    public ResponseEntity<?> actualizarEmpleado(
            @PathVariable Long dni,
            @RequestBody Empleado empleado) {

        try {

            Empleado actualizado = empleadoService.actualizarEmpleado(dni, empleado);

            return ResponseEntity.ok(actualizado);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        }
    }
}