package com.sistema.guardias.autenticacion_service.dto;

import com.sistema.guardias.autenticacion_service.model.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioResponseDto {
    private Long id;
    private String usuario;
    private Rol rol;
    private Long empleadoDni;
    private boolean activo;
}
