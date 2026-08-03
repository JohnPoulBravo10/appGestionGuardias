package com.jpbravo.guardia_service.DTO;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmpleadoDTO {

    private Long dni;
    private String nombre;
    private String apellido;
    private String rol;
    private String email;
    private Long telefono;
    private String direccion;
    private Long usuarioId;
}
