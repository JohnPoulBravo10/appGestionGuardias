package com.sistema.guardias.autenticacion_service.service;

import com.sistema.guardias.autenticacion_service.client.EmpleadoClientWrapper;
import com.sistema.guardias.autenticacion_service.dto.LoginRequestDto;
import com.sistema.guardias.autenticacion_service.dto.NuevoEmpleadoDto;
import com.sistema.guardias.autenticacion_service.dto.RegistroRequestDto;
import com.sistema.guardias.autenticacion_service.dto.TokenDto;
import com.sistema.guardias.autenticacion_service.model.Usuario;
import com.sistema.guardias.autenticacion_service.repository.UsuarioRepository;
import com.sistema.guardias.autenticacion_service.security.JwtProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private EmpleadoClientWrapper empleadoClientWrapper;

    @Transactional
    public Usuario registrar(RegistroRequestDto dto) {
        if (usuarioRepository.findByUsuario(dto.getUsuario()).isPresent()) {
            throw new RuntimeException("El usuario ya existe");
        }

        // 1. Guardar el usuario (credenciales seguras)
        Usuario usuario = Usuario.builder()
                .usuario(dto.getUsuario())
                .password(passwordEncoder.encode(dto.getPassword()))
                .rol(dto.getRolUsuario())
                .build();
        
        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        // 2. Enviar datos del perfil al empleado-service
        NuevoEmpleadoDto empleadoDto = NuevoEmpleadoDto.builder()
                .dni(dto.getDni())
                .nombre(dto.getNombre())
                .apellido(dto.getApellido())
                .email(dto.getEmail())
                .telefono(dto.getTelefono())
                .direccion(dto.getDireccion())
                .rol(dto.getRolEmpleado())
                .usuarioId(usuarioGuardado.getId())
                .build();
        
        empleadoClientWrapper.guardarEmpleado(empleadoDto);
        
        return usuarioGuardado;
    }

    public TokenDto login(LoginRequestDto dto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getUsuario(), dto.getPassword())
        );

        String jwt = jwtProvider.generateToken(authentication);
        return new TokenDto(jwt);
    }

    public TokenDto validate(String token) {
        if (!jwtProvider.validateToken(token)) {
            throw new RuntimeException("Token invalido");
        }
        return new TokenDto(token);
    }
}
