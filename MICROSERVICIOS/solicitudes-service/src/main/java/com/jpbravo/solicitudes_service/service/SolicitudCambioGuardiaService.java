package com.jpbravo.solicitudes_service.service;

import com.jpbravo.solicitudes_service.client.GuardiaServiceClient;
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
    private final GuardiaServiceClient guardiaServiceClient;

    public SolicitudCambioGuardiaService(
            SolicitudCambioGuardiaRepository repository,
            GuardiaServiceClient guardiaServiceClient) {
        this.repository = repository;
        this.guardiaServiceClient = guardiaServiceClient;
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
     * Aprueba una solicitud pendiente y reasigna la guardia correspondiente.
     *
     * Flujo:
     * 1. Valida que la solicitud esté en estado PENDIENTE.
     * 2. Si el admin proporcionó un empleado de reemplazo, actualiza los datos.
     * 3. Comunica al guardia-service para reasignar la guardia al nuevo empleado
     *    (o dejarla sin asignar si no hay reemplazo).
     * 4. Solo si la reasignación fue exitosa, marca la solicitud como APROBADA.
     *
     * @param id                      identificador de la solicitud
     * @param observacion             comentario del administrador (puede ser null)
     * @param empleadoReemplazoDni    DNI del empleado de reemplazo enviado por el admin (puede ser null)
     * @param nombreEmpleadoReemplazo nombre del empleado de reemplazo (puede ser null)
     * @return DTO de respuesta con la solicitud aprobada
     * @throws SolicitudNotFoundException          si no se encuentra la solicitud
     * @throws InvalidStateTransitionException     si la solicitud no está PENDIENTE
     * @throws com.jpbravo.solicitudes_service.exception.GuardiaCommunicationException si falla la comunicación con guardia-service
     */
    public SolicitudResponseDto aprobarSolicitud(
            String id,
            String observacion,
            Long empleadoReemplazoDni,
            String nombreEmpleadoReemplazo) {

        SolicitudCambioGuardia solicitud = buscarSolicitudOFallar(id);
        validarEstadoPendiente(solicitud, EstadoSolicitud.APROBADA);

        // Actualizar datos de reemplazo si el admin los modificó en el modal
        if (empleadoReemplazoDni != null) {
            solicitud.setEmpleadoReemplazoDni(empleadoReemplazoDni);
            solicitud.setNombreEmpleadoReemplazo(nombreEmpleadoReemplazo);
        }

        // Reasignar la guardia ANTES de marcar como aprobada (garantiza consistencia)
        Long guardiaId = solicitud.getInfoGuardia().getGuardiaId();
        Long nuevoEmpleadoId = solicitud.getEmpleadoReemplazoDni();
        guardiaServiceClient.reasignarEmpleado(guardiaId, nuevoEmpleadoId);

        // Marcar como aprobada solo si la reasignación fue exitosa
        solicitud.setEstado(EstadoSolicitud.APROBADA);
        solicitud.setFechaResolucion(LocalDateTime.now());
        solicitud.setObservacionAdmin(observacion);

        SolicitudCambioGuardia actualizada = repository.save(solicitud);
        return convertirAResponseDto(actualizada);
    }

    /**
     * Rechaza una solicitud pendiente. La guardia no se modifica.
     *
     * @param id          identificador de la solicitud
     * @param observacion comentario del administrador (puede ser null)
     * @return DTO de respuesta con la solicitud rechazada
     * @throws SolicitudNotFoundException      si no se encuentra la solicitud
     * @throws InvalidStateTransitionException si la solicitud no está PENDIENTE
     */
    public SolicitudResponseDto rechazarSolicitud(String id, String observacion) {
        SolicitudCambioGuardia solicitud = buscarSolicitudOFallar(id);
        validarEstadoPendiente(solicitud, EstadoSolicitud.RECHAZADA);

        solicitud.setEstado(EstadoSolicitud.RECHAZADA);
        solicitud.setFechaResolucion(LocalDateTime.now());
        solicitud.setObservacionAdmin(observacion);

        SolicitudCambioGuardia actualizada = repository.save(solicitud);
        return convertirAResponseDto(actualizada);
    }

    // ======================== Métodos privados ========================

    /**
     * Valida que la solicitud esté en estado PENDIENTE.
     * Lanza excepción si ya fue resuelta.
     */
    private void validarEstadoPendiente(SolicitudCambioGuardia solicitud, EstadoSolicitud estadoDeseado) {
        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new InvalidStateTransitionException(solicitud.getEstado(), estadoDeseado);
        }
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
