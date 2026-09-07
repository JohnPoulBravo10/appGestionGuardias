package com.jpbravo.solicitudes_service.controller;

import com.jpbravo.solicitudes_service.dto.ResolucionRequestDto;
import com.jpbravo.solicitudes_service.dto.SolicitudRequestDto;
import com.jpbravo.solicitudes_service.dto.SolicitudResponseDto;
import com.jpbravo.solicitudes_service.model.EstadoSolicitud;
import com.jpbravo.solicitudes_service.service.SolicitudCambioGuardiaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.web.server.ResponseStatusException;

/**
 * Controlador REST para la gestión de solicitudes de cambio de guardia.
 * Expone los endpoints CRUD y las operaciones de aprobación/rechazo.
 */
@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudCambioGuardiaController {

    private final SolicitudCambioGuardiaService solicitudService;

    public SolicitudCambioGuardiaController(SolicitudCambioGuardiaService solicitudService) {
        this.solicitudService = solicitudService;
    }

    /**
     * Crea una nueva solicitud de cambio de guardia.
     *
     * @param requestDto datos de la solicitud validados
     * @return solicitud creada con HTTP 201
     */
    @PostMapping
    public ResponseEntity<SolicitudResponseDto> crearSolicitud(
            @Valid @RequestBody SolicitudRequestDto requestDto) {

        SolicitudResponseDto creada = solicitudService.crearSolicitud(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    /**
     * Lista todas las solicitudes de cambio de guardia.
     *
     * @return lista de solicitudes
     */
    @GetMapping
    public ResponseEntity<List<SolicitudResponseDto>> listarSolicitudes(
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        requireAdmin(roles);
        List<SolicitudResponseDto> solicitudes = solicitudService.obtenerTodas();
        return ResponseEntity.ok(solicitudes);
    }

    /**
     * Obtiene una solicitud por su identificador.
     *
     * @param id identificador de la solicitud
     * @return solicitud encontrada
     */
    @GetMapping("/{id}")
    public ResponseEntity<SolicitudResponseDto> obtenerSolicitud(@PathVariable String id) {
        SolicitudResponseDto solicitud = solicitudService.obtenerPorId(id);
        return ResponseEntity.ok(solicitud);
    }

    /**
     * Obtiene todas las solicitudes de un empleado por su DNI.
     *
     * @param empleadoDni DNI del empleado
     * @return lista de solicitudes del empleado
     */
    @GetMapping("/empleado/{empleadoDni}")
    public ResponseEntity<List<SolicitudResponseDto>> obtenerPorEmpleado(
            @PathVariable String empleadoDni,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Dni", required = false) String userDni) {

        requireAdminOrOwner(roles, userDni, empleadoDni);
        List<SolicitudResponseDto> solicitudes = solicitudService.obtenerPorEmpleado(empleadoDni);
        return ResponseEntity.ok(solicitudes);
    }

    /**
     * Filtra las solicitudes por estado.
     *
     * @param estado estado a filtrar (PENDIENTE, APROBADA, RECHAZADA)
     * @return lista de solicitudes con el estado indicado
     */
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<SolicitudResponseDto>> obtenerPorEstado(
            @PathVariable EstadoSolicitud estado,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {

        requireAdmin(roles);
        List<SolicitudResponseDto> solicitudes = solicitudService.obtenerPorEstado(estado);
        return ResponseEntity.ok(solicitudes);
    }

    /**
     * Aprueba una solicitud pendiente.
     * Recibe opcionalmente una observación del administrador y los datos
     * del empleado de reemplazo. Al aprobar, la guardia se reasigna
     * al empleado indicado (o queda sin asignar si no hay reemplazo).
     *
     * @param id   identificador de la solicitud
     * @param body datos de resolución (observación, empleado de reemplazo)
     * @return solicitud aprobada
     */
    @PatchMapping("/{id}/aprobar")
    public ResponseEntity<SolicitudResponseDto> aprobarSolicitud(
            @PathVariable String id,
            @RequestBody(required = false) ResolucionRequestDto body,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {

        requireAdmin(roles);
        SolicitudResponseDto aprobada = solicitudService.aprobarSolicitud(
                id,
                body != null ? body.getObservacion() : null,
                body != null ? body.getEmpleadoReemplazoDni() : null,
                body != null ? body.getNombreEmpleadoReemplazo() : null
        );
        return ResponseEntity.ok(aprobada);
    }

    /**
     * Rechaza una solicitud pendiente.
     * Recibe opcionalmente una observación del administrador.
     * La guardia no se modifica al rechazar.
     *
     * @param id   identificador de la solicitud
     * @param body datos de resolución (solo observación es relevante)
     * @return solicitud rechazada
     */
    @PatchMapping("/{id}/rechazar")
    public ResponseEntity<SolicitudResponseDto> rechazarSolicitud(
            @PathVariable String id,
            @RequestBody(required = false) ResolucionRequestDto body,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {

        requireAdmin(roles);
        SolicitudResponseDto rechazada = solicitudService.rechazarSolicitud(
                id,
                body != null ? body.getObservacion() : null
        );
        return ResponseEntity.ok(rechazada);
    }

    private boolean isAdmin(String roles) {
        return roles != null && roles.contains("ADMIN");
    }

    private void requireAdmin(String roles) {
        if (!isAdmin(roles)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado: Se requiere rol ADMIN");
        }
    }

    private void requireAdminOrOwner(String roles, String userDni, String targetDni) {
        if (!isAdmin(roles) && (userDni == null || !userDni.equals(targetDni))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado: No tiene permisos para este recurso");
        }
    }
}
