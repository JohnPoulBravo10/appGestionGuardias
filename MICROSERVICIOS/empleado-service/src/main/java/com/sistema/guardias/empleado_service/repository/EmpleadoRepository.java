
package com.sistema.guardias.empleado_service.repository;

import com.sistema.guardias.empleado_service.model.Empleado;
import com.sistema.guardias.empleado_service.model.Rol;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {

    
    List<Empleado> findByApellidoContainingIgnoreCase(String apellido);
    List<Empleado> findByRol(Rol rol);
}
