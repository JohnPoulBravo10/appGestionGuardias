
package com.jpbravo.guardia_service.repository;

import com.jpbravo.guardia_service.model.Guardia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuardiaRepository extends JpaRepository<Guardia, Long> {

    List<Guardia> findByEmpleadoId(Long empleadoId);

    /**
     * Obtiene las guardias "activas": aquellas cuya fecha es hoy
     * y cuyo rango horario incluye la hora actual del servidor MySQL.
     *
     * Se usa una native query con CURDATE() y CURTIME() para evitar
     * desajustes de timezone entre el driver JDBC y MySQL al
     * bindear parámetros LocalDate/LocalTime desde Java.
     */
    @Query(value = "SELECT * FROM guardias g "
            + "WHERE g.fecha = CURDATE() "
            + "AND g.hora_inicio <= CURTIME() "
            + "AND g.hora_fin > CURTIME()",
            nativeQuery = true)
    List<Guardia> findGuardiasActivas();
}
