package com.sistema.guardias.autenticacion_service.dto;

import lombok.Data;

/* DTO que representa la solicitud de inicio de sesión.
   Contiene el nombre de usuario y la contraseña del usuario que intenta autenticarse. */
@Data
public class LoginRequestDto {
    private String usuario;
    private String password;
}
