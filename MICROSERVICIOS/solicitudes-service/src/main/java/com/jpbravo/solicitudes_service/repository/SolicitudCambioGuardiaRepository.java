package com.jpbravo.solicitudes_service.repository;

import com.jpbravo.solicitudes_service.model.EstadoSolicitud;
import com.jpbravo.solicitudes_service.model.SolicitudCambioGuardia;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio MongoDB para el acceso a datos de solicitudes de cambio de guardia.
 * Utiliza queries derivadas de Spring Data para las consultas más comunes.
 */
@Repository
public interface SolicitudCambioGuardiaRepository extends MongoRepository<SolicitudCambioGuardia, String> {

    /**
     * Obtiene todas las solicitudes de un empleado por su DNI.
     *
     * @param empleadoDni DNI del empleado solicitante
     * @return lista de solicitudes del empleado
     */
    List<SolicitudCambioGuardia> findByEmpleadoDni(String empleadoDni);

    /**
     * Obtiene todas las solicitudes en un estado determinado.
     *
     * @param estado estado de la solicitud a filtrar
     * @return lista de solicitudes con el estado indicado
     */
    List<SolicitudCambioGuardia> findByEstado(EstadoSolicitud estado);

    /**
     * Obtiene todas las solicitudes en un estado determinado,
     * ordenadas por fecha de creación descendente (más recientes primero).
     *
     * @param estado estado de la solicitud a filtrar
     * @return lista ordenada de solicitudes
     */
    List<SolicitudCambioGuardia> findByEstadoOrderByFechaCreacionDesc(EstadoSolicitud estado);

    /**
     * Obtiene solicitudes de un empleado en un estado determinado.
     * Usado para rechazar automáticamente solicitudes pendientes al dar de baja un empleado.
     *
     * @param empleadoDni DNI del empleado solicitante
     * @param estado estado de la solicitud a filtrar
     * @return lista de solicitudes del empleado en el estado indicado
     */
    List<SolicitudCambioGuardia> findByEmpleadoDniAndEstado(String empleadoDni, EstadoSolicitud estado);
}
