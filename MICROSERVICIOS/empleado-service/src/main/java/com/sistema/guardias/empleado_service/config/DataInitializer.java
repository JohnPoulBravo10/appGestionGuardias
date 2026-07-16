package com.sistema.guardias.empleado_service.config;

import com.sistema.guardias.empleado_service.model.Empleado;
import com.sistema.guardias.empleado_service.model.Rol;
import com.sistema.guardias.empleado_service.repository.EmpleadoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Inicializador de datos para crear usuarios de prueba al arrancar.
 * Solo inserta si el usuario no existe previamente (idempotente).
 */
@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initUsuarios(EmpleadoRepository empleadoRepository) {
        return args -> {
            crearUsuarioSiNoExiste(empleadoRepository,
                    10000001L, "Carlos", "García", Rol.ADMINISTRADOR,
                    "admin@hospital.com", 3425000001L, "Av. Principal 100",
                    "admin", "admin123");

            crearUsuarioSiNoExiste(empleadoRepository,
                    20000001L, "Ana", "Martínez", Rol.ENFERMERIA,
                    "ana@hospital.com", 3425000002L, "Calle Salud 200",
                    "empleado", "emp123");
        };
    }

    /**
     * Crea un empleado en la base de datos si no existe uno con el mismo nombre de usuario.
     * Evita duplicados al re-arrancar el servicio.
     */
    private void crearUsuarioSiNoExiste(EmpleadoRepository repository,
                                         Long dni, String nombre, String apellido,
                                         Rol rol, String email, long telefono,
                                         String direccion, String usuario,
                                         String password) {

        if (repository.findByUsuario(usuario).isEmpty()) {
            Empleado empleado = Empleado.builder()
                    .dni(dni)
                    .nombre(nombre)
                    .apellido(apellido)
                    .rol(rol)
                    .email(email)
                    .telefono(telefono)
                    .direccion(direccion)
                    .usuario(usuario)
                    .password(password)
                    .build();

            repository.save(empleado);
            System.out.println("✓ Usuario de prueba creado: " + usuario + " (rol: " + rol + ")");
        }
    }
}
