package com.jpbravo.solicitudes_service.service;

import com.jpbravo.solicitudes_service.dto.SolicitudRequestDto;
import com.jpbravo.solicitudes_service.dto.SolicitudResponseDto;
import com.jpbravo.solicitudes_service.event.SolicitudEvent;
import com.jpbravo.solicitudes_service.event.TipoSolicitudEvent;
import com.jpbravo.solicitudes_service.exception.InvalidStateTransitionException;
import com.jpbravo.solicitudes_service.exception.SolicitudNotFoundException;
import com.jpbravo.solicitudes_service.model.EstadoSolicitud;
import com.jpbravo.solicitudes_service.model.InfoGuardia;
import com.jpbravo.solicitudes_service.model.SolicitudCambioGuardia;
import com.jpbravo.solicitudes_service.producer.SolicitudEventProducer;
import com.jpbravo.solicitudes_service.repository.SolicitudCambioGuardiaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SolicitudCambioGuardiaService {

    @Autowired
    private SolicitudCambioGuardiaRepository repository;

    @Autowired
    private SolicitudEventProducer solicitudEventProducer;

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

        SolicitudEvent evento = SolicitudEvent.builder()
                .tipoEvento(TipoSolicitudEvent.SOLICITUD_CAMBIO_CREADA)
                .solicitudId(guardada.getId())
                .empleadoDni(guardada.getEmpleadoDni())
                .nombreEmpleado(guardada.getNombreEmpleado())
                .guardiaId(guardada.getInfoGuardia().getGuardiaId())
                .estado(guardada.getEstado().name())
                .fechaEvento(LocalDateTime.now())
                .build();

        solicitudEventProducer.publicarEvento(evento);

        return convertirAResponseDto(guardada);
    }

    public List<SolicitudResponseDto> obtenerTodas() {
        return repository.findAll().stream()
                .map(this::convertirAResponseDto)
                .toList();
    }

    public SolicitudResponseDto obtenerPorId(String id) {

        SolicitudCambioGuardia solicitud = buscarSolicitudOFallar(id);

        return convertirAResponseDto(solicitud);
    }

    public List<SolicitudResponseDto> obtenerPorEmpleado(String empleadoDni) {
        return repository.findByEmpleadoDni(empleadoDni).stream()
                .map(this::convertirAResponseDto)
                .toList();
    }

    public List<SolicitudResponseDto> obtenerPorEstado(EstadoSolicitud estado) {
        return repository.findByEstadoOrderByFechaCreacionDesc(estado).stream()
                .map(this::convertirAResponseDto)
                .toList();
    }

    public SolicitudResponseDto aprobarSolicitud(
            String id,
            String observacion,
            Long empleadoReemplazoDni,
            String nombreEmpleadoReemplazo) {

        SolicitudCambioGuardia solicitud = buscarSolicitudOFallar(id);

        validarEstadoPendiente(solicitud, EstadoSolicitud.APROBADA);

        if (empleadoReemplazoDni != null) {
            solicitud.setEmpleadoReemplazoDni(empleadoReemplazoDni);
            solicitud.setNombreEmpleadoReemplazo(nombreEmpleadoReemplazo);
        }

        solicitud.setEstado(EstadoSolicitud.APROBADA);
        solicitud.setFechaResolucion(LocalDateTime.now());
        solicitud.setObservacionAdmin(observacion);

        SolicitudCambioGuardia actualizada = repository.save(solicitud);

        // El evento SOLICITUD_CAMBIO_ACEPTADA incluye los datos de reasignación
        // para que guardia-service los consuma de forma asíncrona vía Kafka.
        SolicitudEvent evento = SolicitudEvent.builder()
                .tipoEvento(TipoSolicitudEvent.SOLICITUD_CAMBIO_ACEPTADA)
                .solicitudId(actualizada.getId())
                .empleadoDni(actualizada.getEmpleadoDni())
                .nombreEmpleado(actualizada.getNombreEmpleado())
                .guardiaId(actualizada.getInfoGuardia().getGuardiaId())
                .estado(actualizada.getEstado().name())
                .observacionAdmin(actualizada.getObservacionAdmin())
                .empleadoReemplazoDni(actualizada.getEmpleadoReemplazoDni())
                .fechaEvento(LocalDateTime.now())
                .build();

        solicitudEventProducer.publicarEvento(evento);

        return convertirAResponseDto(actualizada);
    }

    public SolicitudResponseDto rechazarSolicitud(String id, String observacion) {

        SolicitudCambioGuardia solicitud = buscarSolicitudOFallar(id);

        validarEstadoPendiente(solicitud, EstadoSolicitud.RECHAZADA);

        solicitud.setEstado(EstadoSolicitud.RECHAZADA);
        solicitud.setFechaResolucion(LocalDateTime.now());
        solicitud.setObservacionAdmin(observacion);

        SolicitudCambioGuardia actualizada = repository.save(solicitud);

        SolicitudEvent evento = SolicitudEvent.builder()
                .tipoEvento(TipoSolicitudEvent.SOLICITUD_CAMBIO_RECHAZADA)
                .solicitudId(actualizada.getId())
                .empleadoDni(actualizada.getEmpleadoDni())
                .nombreEmpleado(actualizada.getNombreEmpleado())
                .guardiaId(actualizada.getInfoGuardia().getGuardiaId())
                .estado(actualizada.getEstado().name())
                .observacionAdmin(actualizada.getObservacionAdmin())
                .fechaEvento(LocalDateTime.now())
                .build();

        solicitudEventProducer.publicarEvento(evento);

        return convertirAResponseDto(actualizada);
    }

    private void validarEstadoPendiente(SolicitudCambioGuardia solicitud, EstadoSolicitud estadoDeseado) {

        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new InvalidStateTransitionException(
                    solicitud.getEstado(),
                    estadoDeseado
            );
        }
    }

    private SolicitudCambioGuardia buscarSolicitudOFallar(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new SolicitudNotFoundException(id));
    }

    private InfoGuardia convertirInfoGuardia(SolicitudRequestDto.InfoGuardiaDto dto) {
        return InfoGuardia.builder()
                .guardiaId(dto.getGuardiaId())
                .fecha(dto.getFecha())
                .horaInicio(dto.getHoraInicio())
                .horaFin(dto.getHoraFin())
                .rol(dto.getRol())
                .build();
    }

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