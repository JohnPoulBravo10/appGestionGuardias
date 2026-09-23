package com.sistema.guardias.autenticacion_service.controller;

import com.sistema.guardias.autenticacion_service.dto.LoginRequestDto;
import com.sistema.guardias.autenticacion_service.dto.RegistroRequestDto;
import com.sistema.guardias.autenticacion_service.dto.TokenDto;
import com.sistema.guardias.autenticacion_service.dto.UsuarioResponseDto;
import com.sistema.guardias.autenticacion_service.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/* Controlador REST que expone los endpoints de registro y login. 
   Estas rutas están permitidas sin token en el SecurityConfig y en el API Gateway. */
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // Endpoint público para el registro de nuevos usuarios (ej. guardias)
    @PostMapping("/register")
    public ResponseEntity<UsuarioResponseDto> registrar(@Valid @RequestBody RegistroRequestDto dto) {
        UsuarioResponseDto nuevoUsuario = authService.registrar(dto);
        return ResponseEntity.ok(nuevoUsuario);
    }

    // Endpoint para iniciar sesión y obtener un JWT
    @PostMapping("/login")
    public ResponseEntity<TokenDto> login(@RequestBody LoginRequestDto dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    // Endpoint utilizado internamente para verificar si un token sigue siendo válido
    @PostMapping("/validate")
    public ResponseEntity<TokenDto> validate(@RequestParam String token) {
        return ResponseEntity.ok(authService.validate(token));
    }
}
