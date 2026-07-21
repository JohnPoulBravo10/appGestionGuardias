package com.sistema.guardias.autenticacion_service.config;

import com.sistema.guardias.autenticacion_service.dto.RegistroRequestDto;
import com.sistema.guardias.autenticacion_service.model.Rol;
import com.sistema.guardias.autenticacion_service.repository.UsuarioRepository;
import com.sistema.guardias.autenticacion_service.service.AuthService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initUsuarios(UsuarioRepository repository, AuthService authService) {
        return args -> {
            try {
                if (repository.findByUsuario("admin").isEmpty()) {
                    RegistroRequestDto adminDto = new RegistroRequestDto();
                    adminDto.setUsuario("admin");
                    adminDto.setPassword("admin123");
                    adminDto.setRolUsuario(Rol.ADMINISTRADOR);
                    adminDto.setRolEmpleado("ADMINISTRADOR");
                    adminDto.setDni(10000001L);
                    adminDto.setNombre("Carlos");
                    adminDto.setApellido("García");
                    adminDto.setEmail("admin@hospital.com");
                    adminDto.setTelefono(3425000001L);
                    adminDto.setDireccion("Av. Principal 100");

                    authService.registrar(adminDto);
                    System.out.println("✓ Usuario de prueba creado: admin (rol: ADMINISTRADOR)");
                }

                if (repository.findByUsuario("empleado").isEmpty()) {
                    RegistroRequestDto empDto = new RegistroRequestDto();
                    empDto.setUsuario("empleado");
                    empDto.setPassword("emp123");
                    empDto.setRolUsuario(Rol.EMPLEADO);
                    empDto.setRolEmpleado("ENFERMERIA");
                    empDto.setDni(20000001L);
                    empDto.setNombre("Ana");
                    empDto.setApellido("Martínez");
                    empDto.setEmail("ana@hospital.com");
                    empDto.setTelefono(3425000002L);
                    empDto.setDireccion("Calle Salud 200");

                    authService.registrar(empDto);
                    System.out.println("✓ Usuario de prueba creado: empleado (rol: EMPLEADO)");
                }
            } catch (Exception e) {
                System.err.println("Error al inicializar datos: " + e.getMessage());
            }
        };
    }
}
