package com.sistema.guardias.autenticacion_service.service;

import com.sistema.guardias.autenticacion_service.dto.LoginRequestDto;
import com.sistema.guardias.autenticacion_service.dto.RegistroRequestDto;
import com.sistema.guardias.autenticacion_service.dto.TokenDto;
import com.sistema.guardias.autenticacion_service.dto.UsuarioResponseDto;
import com.sistema.guardias.autenticacion_service.event.UsuarioRegistradoEvent;
import com.sistema.guardias.autenticacion_service.exception.CampoDuplicadoException;
import com.sistema.guardias.autenticacion_service.model.Usuario;
import com.sistema.guardias.autenticacion_service.producer.UsuarioRegistradoProducer;
import com.sistema.guardias.autenticacion_service.repository.UsuarioRepository;
import com.sistema.guardias.autenticacion_service.security.JwtProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

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
    private UsuarioRegistradoProducer usuarioRegistradoProducer;

    @Transactional
    public UsuarioResponseDto registrar(RegistroRequestDto dto) {
        if (com.sistema.guardias.autenticacion_service.model.Rol.ADMINISTRADOR.equals(dto.getRolUsuario()) || 
            "ADMINISTRADOR".equalsIgnoreCase(dto.getRolEmpleado())) {
            throw new IllegalArgumentException("No está permitido crear usuarios administradores a través del registro público.");
        }

        return procesarRegistro(dto);
    }

    @Transactional
    public UsuarioResponseDto registrarSistema(RegistroRequestDto dto) {
        return procesarRegistro(dto);
    }

    private UsuarioResponseDto procesarRegistro(RegistroRequestDto dto) {
        if (usuarioRepository.findByUsuario(dto.getUsuario()).isPresent()) {
            throw new CampoDuplicadoException("usuario", "El usuario ya existe");
        }

        // 1. Guardar el usuario (credenciales seguras)
        Usuario usuario = Usuario.builder()
                .usuario(dto.getUsuario())
                .password(passwordEncoder.encode(dto.getPassword()))
                .rol(dto.getRolUsuario())
                .empleadoDni(dto.getDni())
                .build();
        
        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        // 2. Publicar evento Kafka para que empleado-service cree el empleado de forma asíncrona
        UsuarioRegistradoEvent evento = UsuarioRegistradoEvent.builder()
                .dni(dto.getDni())
                .nombre(dto.getNombre())
                .apellido(dto.getApellido())
                .email(dto.getEmail())
                .telefono(dto.getTelefono())
                .direccion(dto.getDireccion())
                .rol(dto.getRolEmpleado())
                .usuarioId(usuarioGuardado.getId())
                .fechaEvento(LocalDateTime.now())
                .build();
        
        usuarioRegistradoProducer.publicarEvento(evento);
        
        return UsuarioResponseDto.builder()
                .id(usuarioGuardado.getId())
                .usuario(usuarioGuardado.getUsuario())
                .rol(usuarioGuardado.getRol())
                .empleadoDni(usuarioGuardado.getEmpleadoDni())
                .activo(usuarioGuardado.isActivo())
                .build();
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
