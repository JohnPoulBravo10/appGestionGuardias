package com.sistema.guardias.autenticacion_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/* DTO que representa el token JWT generado tras el inicio de sesión exitoso. */
@Data
@AllArgsConstructor
public class TokenDto {
    private String token;
}
