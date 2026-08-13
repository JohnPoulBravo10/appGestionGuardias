package com.jpbravo.notification_service.repository;

import com.jpbravo.notification_service.model.Notificacion;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionRepository extends MongoRepository<Notificacion, String> {

    List<Notificacion> findByEmpleadoDniOrderByFechaCreacionDesc(Long empleadoDni );

    List<Notificacion>findByEmpleadoDniAndLeidaFalseOrderByFechaCreacionDesc(Long empleadoDni);
    
}