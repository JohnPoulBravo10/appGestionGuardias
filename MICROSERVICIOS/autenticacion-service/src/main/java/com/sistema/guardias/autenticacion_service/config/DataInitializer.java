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
                    adminDto.setPassword("admin");
                    adminDto.setRolUsuario(Rol.ADMINISTRADOR);
                    adminDto.setRolEmpleado("ADMINISTRADOR");
                    adminDto.setDni(10000001L);
                    adminDto.setNombre("Carlos");
                    adminDto.setApellido("García");
                    adminDto.setEmail("admin@hospital.com");
                    adminDto.setTelefono(3425000001L);
                    adminDto.setDireccion("Av. Principal 100");

                    authService.registrarSistema(adminDto);
                    System.out.println("✓ Usuario de prueba creado: admin (rol: ADMINISTRADOR)");
                }

                if (repository.findByUsuario("enfermeria").isEmpty()) {
                    RegistroRequestDto enfermeriaDto = new RegistroRequestDto();
                    enfermeriaDto.setUsuario("enfermeria");
                    enfermeriaDto.setPassword("enfermeria");
                    enfermeriaDto.setRolUsuario(Rol.EMPLEADO);
                    enfermeriaDto.setRolEmpleado("ENFERMERIA");
                    enfermeriaDto.setDni(20000001L);
                    enfermeriaDto.setNombre("Ana");
                    enfermeriaDto.setApellido("Martínez");
                    enfermeriaDto.setEmail("ana@hospital.com");
                    enfermeriaDto.setTelefono(3425000002L);
                    enfermeriaDto.setDireccion("Calle Salud 200");

                    authService.registrarSistema(enfermeriaDto);
                    System.out.println("✓ Usuario de prueba creado: enfermeria (rol: ENFERMERIA)");
                }

                if (repository.findByUsuario("mantenimiento").isEmpty()) {
                    RegistroRequestDto mantenimientoDto = new RegistroRequestDto();
                    mantenimientoDto.setUsuario("mantenimiento");
                    mantenimientoDto.setPassword("mantenimiento");
                    mantenimientoDto.setRolUsuario(Rol.EMPLEADO);
                    mantenimientoDto.setRolEmpleado("MANTENIMIENTO");
                    mantenimientoDto.setDni(30000001L);
                    mantenimientoDto.setNombre("Luis");
                    mantenimientoDto.setApellido("Pérez");
                    mantenimientoDto.setEmail("luis@hospital.com");
                    mantenimientoDto.setTelefono(3425000003L);
                    mantenimientoDto.setDireccion("Calle Herramienta 300");

                    authService.registrarSistema(mantenimientoDto);
                    System.out.println("✓ Usuario de prueba creado: mantenimiento (rol: MANTENIMIENTO)");
                }

                if (repository.findByUsuario("limpieza").isEmpty()) {
                    RegistroRequestDto limpiezaDto = new RegistroRequestDto();
                    limpiezaDto.setUsuario("limpieza");
                    limpiezaDto.setPassword("limpieza");
                    limpiezaDto.setRolUsuario(Rol.EMPLEADO);
                    limpiezaDto.setRolEmpleado("LIMPIEZA");
                    limpiezaDto.setDni(40000001L);
                    limpiezaDto.setNombre("María");
                    limpiezaDto.setApellido("Gómez");
                    limpiezaDto.setEmail("maria@hospital.com");
                    limpiezaDto.setTelefono(3425000004L);
                    limpiezaDto.setDireccion("Calle Escoba 400");

                    authService.registrarSistema(limpiezaDto);
                    System.out.println("✓ Usuario de prueba creado: limpieza (rol: LIMPIEZA)");
                }
            } catch (Exception e) {
                System.err.println("Error al inicializar datos: " + e.getMessage());
            }
        };
    }
}
