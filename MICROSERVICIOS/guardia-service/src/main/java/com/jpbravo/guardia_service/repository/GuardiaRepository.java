package com.jpbravo.guardia_service.repository;

import com.jpbravo.guardia_service.model.EstadoGuardia;
import com.jpbravo.guardia_service.model.Guardia;
import com.jpbravo.guardia_service.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GuardiaRepository
        extends JpaRepository<Guardia, Long> {

    List<Guardia> findByEmpleadoId(Long empleadoId);

    List<Guardia> findByRol(Rol rol);

    List<Guardia> findByEstadoNot(EstadoGuardia estado);

    List<Guardia> findByEstado(EstadoGuardia estado);

    /**
     * Obtiene guardias futuras de un empleado con un estado específico.
     * Usado para liberar guardias al desactivar un empleado.
     */
    List<Guardia> findByEmpleadoIdAndFechaGreaterThanEqualAndEstado(
            Long empleadoId, LocalDate fecha, EstadoGuardia estado);
}