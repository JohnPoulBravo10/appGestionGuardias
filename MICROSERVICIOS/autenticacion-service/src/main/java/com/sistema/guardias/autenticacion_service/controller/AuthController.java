package com.sistema.guardias.autenticacion_service.controller;

import com.sistema.guardias.autenticacion_service.dto.LoginRequestDto;
import com.sistema.guardias.autenticacion_service.dto.RegistroRequestDto;
import com.sistema.guardias.autenticacion_service.dto.TokenDto;
import com.sistema.guardias.autenticacion_service.model.Usuario;
import com.sistema.guardias.autenticacion_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Usuario> registrar(@RequestBody RegistroRequestDto dto) {
        Usuario nuevoUsuario = authService.registrar(dto);
        return ResponseEntity.ok(nuevoUsuario);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenDto> login(@RequestBody LoginRequestDto dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @PostMapping("/validate")
    public ResponseEntity<TokenDto> validate(@RequestParam String token) {
        return ResponseEntity.ok(authService.validate(token));
    }
}
