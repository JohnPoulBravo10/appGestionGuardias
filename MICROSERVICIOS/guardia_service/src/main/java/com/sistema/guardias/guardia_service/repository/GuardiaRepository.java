
package com.sistema.guardias.guardia_service.repository;


import com.sistema.guardias.guardia_service.model.Guardia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GuardiaRepository extends JpaRepository<Guardia, Long> {
    
    // Buscar guardias por empleado
    List<Guardia> findByEmpleadoId(Long empleadoId);
    
    // Buscar guardias en un rango de fechas (útil para el calendario)
    List<Guardia> findByFechaInicioBetween(LocalDateTime inicio, LocalDateTime fin);
}
