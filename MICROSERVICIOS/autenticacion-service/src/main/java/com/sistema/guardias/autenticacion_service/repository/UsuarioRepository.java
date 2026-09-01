package com.sistema.guardias.autenticacion_service.repository;

import com.sistema.guardias.autenticacion_service.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsuario(String usuario);

    /** Busca un usuario por el DNI del empleado asociado. */
    Optional<Usuario> findByEmpleadoDni(Long empleadoDni);
}
