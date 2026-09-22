package com.sistema.guardias.autenticacion_service.dto;

import com.sistema.guardias.autenticacion_service.model.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/* DTO que representa la respuesta del registro de un nuevo usuario.
   Incluye el DNI del empleado, el nombre de usuario, el rol, el DNI del empleado asociado y el estado activo. */
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
