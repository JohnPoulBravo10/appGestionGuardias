package com.jpbravo.guardia_service.controller;


import com.jpbravo.guardia_service.dto.CrearGuardiaDto;
import com.jpbravo.guardia_service.dto.GuardiaResponseDto;
import com.jpbravo.guardia_service.model.Guardia;
import com.jpbravo.guardia_service.model.Rol;
import com.jpbravo.guardia_service.service.GuardiaService;
import com.jpbravo.guardia_service.validation.GuardiaValidator;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/guardias")
public class GuardiaContoller {

    @Autowired
    private GuardiaService guardiaService;

    @Autowired
    private GuardiaValidator guardiaValidator;

    @GetMapping
    public ResponseEntity<List<GuardiaResponseDto>>
            listarGuardias(@RequestHeader(value = "X-User-Roles", required = false) String roles) {

        requireAdmin(roles);
        List<GuardiaResponseDto> guardias =
                guardiaService
                        .obtenerTodasConEmpleado();

        return ResponseEntity.ok(guardias);
    }

    @GetMapping("/activas")
    public List<Guardia> listarGuardiasActivas(@RequestHeader(value = "X-User-Roles", required = false) String roles) {
        requireAdmin(roles);
        return guardiaService
                .obtenerGuardiasActivas();
    }

    @GetMapping("/area/{rol}")
    public ResponseEntity<List<GuardiaResponseDto>>
            obtenerGuardiasPorArea(
                    @PathVariable Rol rol
            ) {

        List<GuardiaResponseDto> guardias =
                guardiaService
                        .obtenerPorAreaConEmpleado(
                                rol
                        );

        return ResponseEntity.ok(guardias);
    }

    @GetMapping("/empleado/{idEmpleado}")
    public ResponseEntity<List<Guardia>>
            obtenerGuardiasEmpleado(
                    @PathVariable Long idEmpleado,
                    @RequestHeader(value = "X-User-Roles", required = false) String roles,
                    @RequestHeader(value = "X-User-Dni", required = false) String userDni
            ) {

        requireAdminOrOwner(roles, userDni, idEmpleado);
        List<Guardia> guardias =
                guardiaService
                        .obtenerGuardiasEmpleado(
                                idEmpleado
                        );

        return ResponseEntity.ok(guardias);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Guardia>
            obtenerGuardia(
                    @PathVariable Long id
            ) {

        return guardiaService
                .obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(
                    ResponseEntity
                            .notFound()
                            .build()
                );
    }

    @PostMapping
    public ResponseEntity<?> crearGuardia(
            @Valid @RequestBody CrearGuardiaDto dto,
            @RequestHeader(value = "X-User-Roles", required = false) String roles
    ) {
        requireAdmin(roles);
        /*
         * Validación de reglas de negocio (coherencia de horario)
         * que no se puede expresar con anotaciones Jakarta.
         */
        Map<String, String> erroresHorario =
                guardiaValidator.validar(
                        dto.getFecha(),
                        dto.getHoraInicio(),
                        dto.getHoraFin()
                );

        if (!erroresHorario.isEmpty()) {
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("errores", erroresHorario);

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(respuesta);
        }

        Guardia guardia = convertirDtoAEntidad(dto);

        Guardia guardiaCreada =
                guardiaService.guardarGuardia(guardia);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(guardiaCreada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
            eliminarGuardia(
                    @PathVariable Long id,
                    @RequestHeader(value = "X-User-Roles", required = false) String roles
            ) {

        requireAdmin(roles);
        guardiaService.eliminarGuardia(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?>
            actualizarGuardia(
                    @PathVariable Long id,
                    @Valid @RequestBody CrearGuardiaDto dto,
                    @RequestHeader(value = "X-User-Roles", required = false) String roles
            ) {

        requireAdmin(roles);
        /*
         * Validación de reglas de negocio (coherencia de horario)
         * que no se puede expresar con anotaciones Jakarta.
         */
        Map<String, String> erroresHorario =
                guardiaValidator.validar(
                        dto.getFecha(),
                        dto.getHoraInicio(),
                        dto.getHoraFin()
                );

        if (!erroresHorario.isEmpty()) {
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("errores", erroresHorario);

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(respuesta);
        }

        Guardia guardia = convertirDtoAEntidad(dto);

        Guardia actualizada =
                guardiaService
                        .actualizarGuardia(
                                id,
                                guardia
                        );

        return ResponseEntity.ok(
                actualizada
        );
    }

    /**
     * Convierte un DTO de creación/edición a la entidad Guardia.
     * El estado se determina en el service según si tiene empleado asignado.
     */
    private Guardia convertirDtoAEntidad(CrearGuardiaDto dto) {
        return Guardia.builder()
                .fecha(dto.getFecha())
                .horaInicio(dto.getHoraInicio())
                .horaFin(dto.getHoraFin())
                .rol(dto.getRol())
                .empleadoId(dto.getEmpleadoId())
                .build();
    }

    private boolean isAdmin(String roles) {
        return roles != null && roles.contains("ADMIN");
    }

    private void requireAdmin(String roles) {
        if (!isAdmin(roles)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado: Se requiere rol ADMIN");
        }
    }

    private void requireAdminOrOwner(String roles, String userDni, Long targetDni) {
        if (!isAdmin(roles) && (userDni == null || !userDni.equals(String.valueOf(targetDni)))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado: No tiene permisos para este recurso");
        }
    }
}
