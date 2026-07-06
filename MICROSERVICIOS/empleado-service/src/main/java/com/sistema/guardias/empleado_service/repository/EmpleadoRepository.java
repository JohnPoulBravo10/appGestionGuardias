
package com.sistema.guardias.empleado_service.repository;

import com.sistema.guardias.empleado_service.model.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {

    
    Optional<Empleado> findByDni(String dni);
    java.util.List<Empleado> findByApellidoContainingIgnoreCase(String apellido);
}
