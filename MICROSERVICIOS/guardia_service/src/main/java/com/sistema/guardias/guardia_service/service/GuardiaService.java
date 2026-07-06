
package com.sistema.guardias.guardia_service.service;

import com.sistema.guardias.guardia_service.model.Guardia;
import com.sistema.guardias.guardia_service.repository.GuardiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class GuardiaService {

    @Autowired
    private GuardiaRepository repository;

    public List<Guardia> obtenerTodas() {
        return repository.findAll();
    }

    public Optional<Guardia> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    public Guardia guardarGuardia(Guardia guardia) {
        // Aquí podrías agregar validaciones: fechaFin > fechaInicio
        return repository.save(guardia);
    }

    public void eliminarGuardia(Long id) {
        repository.deleteById(id);
    }
}
