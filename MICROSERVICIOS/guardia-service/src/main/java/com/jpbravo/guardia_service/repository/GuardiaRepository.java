
package com.jpbravo.guardia_service.repository;

import com.jpbravo.guardia_service.model.Guardia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GuardiaRepository extends JpaRepository<Guardia, Long>{
    
    List<Guardia> findByEmpleadoId(Long empleadoId);
    
}
