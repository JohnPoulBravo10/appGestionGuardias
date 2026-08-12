package com.jpbravo.solicitudes_service.service;

import com.jpbravo.solicitudes_service.dto.SolicitudRequestDto;
import com.jpbravo.solicitudes_service.dto.SolicitudResponseDto;
import com.jpbravo.solicitudes_service.exception.InvalidStateTransitionException;
import com.jpbravo.solicitudes_service.exception.SolicitudNotFoundException;
import com.jpbravo.solicitudes_service.model.EstadoSolicitud;
import com.jpbravo.solicitudes_service.model.InfoGuardia;
import com.jpbravo.solicitudes_service.model.SolicitudCambioGuardia;
import com.jpbravo.solicitudes_service.repository.SolicitudCambioGuardiaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio que encapsula la lógica de negocio para las solicitudes
 * de cambio de guardia. Gestiona la creación, consulta y resolución
 * (aprobación/rechazo) de solicitudes.
 */
@Service
public class SolicitudCambioGuardiaService {

    private final SolicitudCambioGuardiaRepository repository;

    public SolicitudCambioGuardiaService(SolicitudCambioGuardiaRepository repository) {
        this.repository = repository;
    }

    /**
     * Crea una nueva solicitud de cambio de guardia con estado PENDIENTE.
     * Convierte el DTO de entrada al documento MongoDB y registra
     * la fecha de creación automáticamente.
     *
     * @param requestDto datos de la solicitud a crear
     * @return DTO de respuesta con la solicitud creada
     */
    public SolicitudResponseDto crearSolicitud(SolicitudRequestDto requestDto) {
        InfoGuardia infoGuardia = convertirInfoGuardia(requestDto.getInfoGuardia());

        SolicitudCambioGuardia solicitud = SolicitudCambioGuardia.builder()
                .nombreEmpleado(requestDto.getNombreEmpleado())
                .empleadoDni(requestDto.getEmpleadoDni())
                .infoGuardia(infoGuardia)
                .motivo(requestDto.getMotivo())
                .estado(EstadoSolicitud.PENDIENTE)
                .nombreEmpleadoReemplazo(requestDto.getNombreEmpleadoReemplazo())
                .empleadoReemplazoDni(requestDto.getEmpleadoReemplazoDni())
                .fechaCreacion(LocalDateTime.now())
                .build();

        SolicitudCambioGuardia guardada = repository.save(solicitud);
        return convertirAResponseDto(guardada);
    }

    /**
     * Obtiene todas las solicitudes existentes.
     *
     * @return lista de DTOs de respuesta
     */
    public List<SolicitudResponseDto> obtenerTodas() {
        return repository.findAll().stream()
                .map(this::convertirAResponseDto)
                .toList();
    }

    /**
     * Obtiene una solicitud por su identificador.
     *
     * @param id identificador de la solicitud
     * @return DTO de respuesta
     * @throws SolicitudNotFoundException si no se encuentra la solicitud
     */
    public SolicitudResponseDto obtenerPorId(String id) {
        SolicitudCambioGuardia solicitud = buscarSolicitudOFallar(id);
        return convertirAResponseDto(solicitud);
    }

    /**
     * Obtiene todas las solicitudes de un empleado por su DNI.
     *
     * @param empleadoDni DNI del empleado solicitante
     * @return lista de DTOs de respuesta
     */
    public List<SolicitudResponseDto> obtenerPorEmpleado(String empleadoDni) {
        return repository.findByEmpleadoDni(empleadoDni).stream()
                .map(this::convertirAResponseDto)
                .toList();
    }

    /**
     * Obtiene todas las solicitudes en un estado determinado.
     *
     * @param estado estado a filtrar
     * @return lista de DTOs de respuesta
     */
    public List<SolicitudResponseDto> obtenerPorEstado(EstadoSolicitud estado) {
        return repository.findByEstadoOrderByFechaCreacionDesc(estado).stream()
                .map(this::convertirAResponseDto)
                .toList();
    }

    /**
     * Aprueba una solicitud pendiente. Solo se permite la transición
     * PENDIENTE → APROBADA.
     *
     * @param id          identificador de la solicitud
     * @param observacion comentario del administrador (puede ser null)
     * @return DTO de respuesta con la solicitud aprobada
     * @throws SolicitudNotFoundException si no se encuentra la solicitud
     * @throws InvalidStateTransitionException si la solicitud no está PENDIENTE
     */
    public SolicitudResponseDto aprobarSolicitud(String id, String observacion) {
        return resolverSolicitud(id, EstadoSolicitud.APROBADA, observacion);
    }

    /**
     * Rechaza una solicitud pendiente. Solo se permite la transición
     * PENDIENTE → RECHAZADA.
     *
     * @param id          identificador de la solicitud
     * @param observacion comentario del administrador (puede ser null)
     * @return DTO de respuesta con la solicitud rechazada
     * @throws SolicitudNotFoundException si no se encuentra la solicitud
     * @throws InvalidStateTransitionException si la solicitud no está PENDIENTE
     */
    public SolicitudResponseDto rechazarSolicitud(String id, String observacion) {
        return resolverSolicitud(id, EstadoSolicitud.RECHAZADA, observacion);
    }

    // ======================== Métodos privados ========================

    /**
     * Resuelve una solicitud cambiando su estado y registrando la fecha
     * de resolución. Valida que la solicitud esté en estado PENDIENTE
     * antes de permitir la transición.
     */
    private SolicitudResponseDto resolverSolicitud(String id, EstadoSolicitud nuevoEstado, String observacion) {
        SolicitudCambioGuardia solicitud = buscarSolicitudOFallar(id);

        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new InvalidStateTransitionException(solicitud.getEstado(), nuevoEstado);
        }

        solicitud.setEstado(nuevoEstado);
        solicitud.setFechaResolucion(LocalDateTime.now());
        solicitud.setObservacionAdmin(observacion);

        SolicitudCambioGuardia actualizada = repository.save(solicitud);
        return convertirAResponseDto(actualizada);
    }

    /**
     * Busca una solicitud por ID o lanza excepción si no existe.
     */
    private SolicitudCambioGuardia buscarSolicitudOFallar(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new SolicitudNotFoundException(id));
    }

    /**
     * Convierte el DTO de info guardia al modelo de dominio.
     */
    private InfoGuardia convertirInfoGuardia(SolicitudRequestDto.InfoGuardiaDto dto) {
        return InfoGuardia.builder()
                .guardiaId(dto.getGuardiaId())
                .fecha(dto.getFecha())
                .horaInicio(dto.getHoraInicio())
                .horaFin(dto.getHoraFin())
                .rol(dto.getRol())
                .build();
    }

    /**
     * Convierte un documento MongoDB al DTO de respuesta.
     */
    private SolicitudResponseDto convertirAResponseDto(SolicitudCambioGuardia solicitud) {
        return SolicitudResponseDto.builder()
                .id(solicitud.getId())
                .nombreEmpleado(solicitud.getNombreEmpleado())
                .empleadoDni(solicitud.getEmpleadoDni())
                .infoGuardia(solicitud.getInfoGuardia())
                .motivo(solicitud.getMotivo())
                .estado(solicitud.getEstado())
                .nombreEmpleadoReemplazo(solicitud.getNombreEmpleadoReemplazo())
                .empleadoReemplazoDni(solicitud.getEmpleadoReemplazoDni())
                .fechaCreacion(solicitud.getFechaCreacion())
                .fechaResolucion(solicitud.getFechaResolucion())
                .observacionAdmin(solicitud.getObservacionAdmin())
                .build();
    }
}
