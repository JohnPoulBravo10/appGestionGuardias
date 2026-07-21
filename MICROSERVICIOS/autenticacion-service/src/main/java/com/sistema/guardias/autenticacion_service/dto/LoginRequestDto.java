package com.sistema.guardias.autenticacion_service.dto;

import lombok.Data;

@Data
public class LoginRequestDto {
    private String usuario;
    private String password;
}
