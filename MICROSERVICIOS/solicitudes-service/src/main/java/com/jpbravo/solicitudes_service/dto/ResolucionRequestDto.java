package com.jpbravo.solicitudes_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/* DTO de entrada para resolver (aprobar/rechazar) una solicitud.
   Permite al administrador indicar una observación y, opcionalmente,
   modificar el empleado de reemplazo al momento de la resolución. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResolucionRequestDto {

    private String observacion;

    private Long empleadoReemplazoDni;

    private String nombreEmpleadoReemplazo;
}
