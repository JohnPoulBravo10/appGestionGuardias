package com.jpbravo.solicitudes_service.repository;

import com.jpbravo.solicitudes_service.model.EstadoSolicitud;
import com.jpbravo.solicitudes_service.model.SolicitudCambioGuardia;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudCambioGuardiaRepository extends MongoRepository<SolicitudCambioGuardia, String> {

    List<SolicitudCambioGuardia> findByEmpleadoDni(String empleadoDni);

    List<SolicitudCambioGuardia> findByEstado(EstadoSolicitud estado);

    List<SolicitudCambioGuardia> findByEstadoOrderByFechaCreacionDesc(EstadoSolicitud estado);

    List<SolicitudCambioGuardia> findByEmpleadoDniAndEstado(String empleadoDni, EstadoSolicitud estado);
}
