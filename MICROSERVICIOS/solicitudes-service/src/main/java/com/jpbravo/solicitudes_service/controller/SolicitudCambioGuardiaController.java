package com.jpbravo.solicitudes_service.controller;

import com.jpbravo.solicitudes_service.dto.SolicitudRequestDto;
import com.jpbravo.solicitudes_service.dto.SolicitudResponseDto;
import com.jpbravo.solicitudes_service.model.EstadoSolicitud;
import com.jpbravo.solicitudes_service.service.SolicitudCambioGuardiaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    public ResponseEntity<List<SolicitudResponseDto>> listarSolicitudes() {
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
            @PathVariable String empleadoDni) {

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
            @PathVariable EstadoSolicitud estado) {

        List<SolicitudResponseDto> solicitudes = solicitudService.obtenerPorEstado(estado);
        return ResponseEntity.ok(solicitudes);
    }

    /**
     * Aprueba una solicitud pendiente.
     * Recibe opcionalmente una observación del administrador.
     *
     * @param id   identificador de la solicitud
     * @param body mapa con la clave "observacion" (opcional)
     * @return solicitud aprobada
     */
    @PatchMapping("/{id}/aprobar")
    public ResponseEntity<SolicitudResponseDto> aprobarSolicitud(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body) {

        String observacion = extraerObservacion(body);
        SolicitudResponseDto aprobada = solicitudService.aprobarSolicitud(id, observacion);
        return ResponseEntity.ok(aprobada);
    }

    /**
     * Rechaza una solicitud pendiente.
     * Recibe opcionalmente una observación del administrador.
     *
     * @param id   identificador de la solicitud
     * @param body mapa con la clave "observacion" (opcional)
     * @return solicitud rechazada
     */
    @PatchMapping("/{id}/rechazar")
    public ResponseEntity<SolicitudResponseDto> rechazarSolicitud(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body) {

        String observacion = extraerObservacion(body);
        SolicitudResponseDto rechazada = solicitudService.rechazarSolicitud(id, observacion);
        return ResponseEntity.ok(rechazada);
    }

    /**
     * Extrae la observación del mapa del body, tolerando body nulo.
     */
    private String extraerObservacion(Map<String, String> body) {
        return (body != null) ? body.get("observacion") : null;
    }
}
