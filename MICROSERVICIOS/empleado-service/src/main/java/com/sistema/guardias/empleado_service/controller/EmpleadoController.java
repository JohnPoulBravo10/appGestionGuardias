package com.sistema.guardias.empleado_service.controller;

import com.sistema.guardias.empleado_service.model.Empleado;
import com.sistema.guardias.empleado_service.model.Rol;
import com.sistema.guardias.empleado_service.service.EmpleadoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/* Controlador REST para la gestión de empleados. 
   Requiere rol ADMIN para operaciones de modificación y listado global. */
@RestController
@RequestMapping("/api/empleados")
@Slf4j
public class EmpleadoController {

    @Autowired
    private EmpleadoService empleadoService;

    // Listado de todos los empleados activos.
    @GetMapping
    public List<Empleado> listarEmpleados(
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {

        requireAdmin(roles);

        return empleadoService.obtenerTodos();
    }

    // Creacion de un nuevo empleado.
    @PostMapping
    public ResponseEntity<?> crearEmpleado(
            @RequestBody Empleado empleado,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {

        requireAdmin(roles);
        try {
            Empleado nuevo = empleadoService.guardarEmpleado(empleado);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(nuevo);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
        }
    }

    // Obtiene empleados activos filtrados por rol.
    @GetMapping("/area/{rol}")
    public List<Empleado> listarEmpleadosPorRol(
            @PathVariable("rol") String rol) {

        try {
            Rol enumRol = Rol.valueOf(rol.toUpperCase());
            return empleadoService.obtenerPorRol(enumRol);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol inválido: " + rol);
        }
    }

    // Obtiene un empleado por su DNI.
    @GetMapping("/{dni}")
    public ResponseEntity<Empleado> obtenerEmpleado(
            @PathVariable Long dni,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Dni", required = false) String userDni) {

        requireAdminOrOwner(roles, userDni, String.valueOf(dni));

        return empleadoService
                .obtenerPorId(dni)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Obtiene un empleado por su usuarioId.
    @GetMapping("/por-usuario/{usuarioId}")
    public ResponseEntity<Empleado> obtenerPorUsuarioId(
            @PathVariable Long usuarioId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Id", required = false) String tokenUserId) {

        requireAdminOrOwner(roles, tokenUserId, String.valueOf(usuarioId));

        return empleadoService
                .buscarPorUsuarioId(usuarioId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Elimina un empleado (lo da de baja).
    @DeleteMapping("/{dni}")
    public ResponseEntity<?> eliminarEmpleado(
            @PathVariable Long dni,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {

        requireAdmin(roles);
        try {
            empleadoService.desactivarEmpleado(dni);

            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // Actualiza un empleado.
    @PutMapping("/{dni}")
    public ResponseEntity<?> actualizarEmpleado(
            @PathVariable Long dni,
            @RequestBody Empleado empleado,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {

        requireAdmin(roles);
        try {
            Empleado actualizado = empleadoService.actualizarEmpleado(dni, empleado);

            return ResponseEntity.ok(actualizado);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // Métodos privados de utilidad.

    private boolean isAdmin(String roles) {
        return roles != null && roles.contains("ADMIN");
    }

    // Verifica si el usuario es ADMIN.
    private void requireAdmin(String roles) {
        if (!isAdmin(roles)) {
            log.warn("Acceso denegado: se requiere rol ADMIN (roles recibidos: '{}')", roles);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado: Se requiere rol ADMIN");
        }
    }

    // Verifica si el usuario es ADMIN o el dueño del recurso.
    private void requireAdminOrOwner(String roles, String tokenVal, String targetVal) {
        if (!isAdmin(roles) && (tokenVal == null || !tokenVal.equals(targetVal))) {
            log.warn("Acceso denegado: recurso no pertenece al usuario autenticado (roles: '{}', userToken: '{}', target: '{}')",
                    roles, tokenVal, targetVal);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Acceso denegado: No tiene permisos para este recurso");
        }
    }
}