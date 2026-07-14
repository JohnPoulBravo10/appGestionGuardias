
package com.jpbravo.guardia_service.controller;

import com.jpbravo.guardia_service.model.Guardia;
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
    public List<Guardia> listarGuardias() {
        return guardiaService.obtenerTodas();
    }

    @PostMapping
    public Guardia crearGuardia(@RequestBody Guardia guardia) {
        return guardiaService.guardarGuardia(guardia);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Guardia> obtenerGuardia(@PathVariable Long id) {
        return guardiaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarGuardia(@PathVariable Long id) {
        guardiaService.eliminarGuardia(id);
        return ResponseEntity.noContent().build();
    }
}
