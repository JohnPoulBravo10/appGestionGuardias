
package com.sistema.guardias.empleado_service.controller;


import com.sistema.guardias.empleado_service.model.Empleado;
import com.sistema.guardias.empleado_service.service.EmpleadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empleados")
public class EmpleadoController {

    @Autowired
    private EmpleadoService empleadoService;

    @GetMapping
    public List<Empleado> listarEmpleados() {
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
}