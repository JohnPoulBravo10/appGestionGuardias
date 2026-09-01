package com.jpbravo.guardia_service.repository;

import com.jpbravo.guardia_service.model.EstadoGuardia;
import com.jpbravo.guardia_service.model.Guardia;
import com.jpbravo.guardia_service.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuardiaRepository
        extends JpaRepository<Guardia, Long> {

    List<Guardia> findByEmpleadoId(Long empleadoId);

    List<Guardia> findByRol(Rol rol);

    List<Guardia> findByEstadoNot(EstadoGuardia estado);

    @Query(
        value = "SELECT * FROM guardias g "
                + "WHERE g.fecha = CURDATE() "
                + "AND g.hora_inicio <= CURTIME() "
                + "AND g.hora_fin > CURTIME()",
        nativeQuery = true
    )
    List<Guardia> findGuardiasActivas();
}