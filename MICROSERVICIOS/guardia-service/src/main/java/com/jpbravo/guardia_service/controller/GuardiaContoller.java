package com.jpbravo.guardia_service.controller;

import com.jpbravo.guardia_service.dto.AsignacionEmpleadoDto;
import com.jpbravo.guardia_service.DTO.GuardiaResponseDto;
import com.jpbravo.guardia_service.model.Guardia;
import com.jpbravo.guardia_service.model.Rol;
import com.jpbravo.guardia_service.service.GuardiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guardias")
public class GuardiaContoller {

    @Autowired
    private GuardiaService guardiaService;

    @GetMapping
    public ResponseEntity<List<GuardiaResponseDto>>
            listarGuardias() {

        List<GuardiaResponseDto> guardias =
                guardiaService
                        .obtenerTodasConEmpleado();

        return ResponseEntity.ok(guardias);
    }

    @GetMapping("/activas")
    public List<Guardia> listarGuardiasActivas() {
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
                    @PathVariable Long idEmpleado
            ) {

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
    public Guardia crearGuardia(
            @RequestBody Guardia guardia
    ) {
        return guardiaService
                .guardarGuardia(guardia);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
            eliminarGuardia(
                    @PathVariable Long id
            ) {

        guardiaService.eliminarGuardia(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Guardia>
            actualizarGuardia(
                    @PathVariable Long id,
                    @RequestBody Guardia guardia
            ) {

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
     * Reasigna el empleado de una guardia existente.
     * Si {@code empleadoId} es {@code null}, la guardia queda sin asignar.
     * Endpoint dedicado para la resolución de solicitudes de cambio de guardia.
     *
     * @param id   identificador de la guardia
     * @param dto  datos de reasignación con el nuevo empleadoId (puede ser null)
     * @return guardia actualizada
     */
    @PatchMapping("/{id}/reasignar")
    public ResponseEntity<Guardia> reasignarEmpleado(
            @PathVariable Long id,
            @RequestBody AsignacionEmpleadoDto dto) {

        Guardia actualizada = guardiaService.reasignarEmpleado(id, dto.getEmpleadoId());
        return ResponseEntity.ok(actualizada);
    }
}
