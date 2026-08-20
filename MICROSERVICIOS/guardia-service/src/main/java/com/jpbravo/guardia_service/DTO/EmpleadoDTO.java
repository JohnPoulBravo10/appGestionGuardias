package com.jpbravo.guardia_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmpleadoDto {

    private Long dni;
    private String nombre;
    private String apellido;
    private String rol;
    private String email;
    private Long telefono;
    private String direccion;
    private Long usuarioId;
}
