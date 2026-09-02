package com.jpbravo.guardia_service.repository;

import com.jpbravo.guardia_service.model.EmpleadoCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio JPA para la caché local de empleados.
 * Permite consultar datos de empleados sin llamadas HTTP a empleado-service.
 */
@Repository
public interface EmpleadoCacheRepository
        extends JpaRepository<EmpleadoCache, Long> {

    /**
     * Busca un empleado en la caché por su DNI.
     * Equivalente a {@code findById}, pero con nombre semántico explícito.
     */
    Optional<EmpleadoCache> findByDni(Long dni);
}
