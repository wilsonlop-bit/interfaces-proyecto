package com.example.proyecto.service;

import com.example.proyecto.dto.UsuarioDTO;
import com.example.proyecto.model.Usuario;
import com.example.proyecto.repository.UsuarioRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {
    @Autowired
    private UsuarioRepository repository;

    @PostConstruct
    public void inicializarDatos() {
        if (repository.count() == 0) {
            repository.save(new Usuario(null, "Juan Pérez", "juanperez", "Administrador", "Activo"));
            repository.save(new Usuario(null, "María González", "mariagonzalez", "Empleado", "Activo"));
            repository.save(new Usuario(null, "Carlos Rodríguez", "carlosrod", "Empleado", "Activo"));
        }
    }

    public List<UsuarioDTO> obtenerTodos() {
        return repository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public UsuarioDTO obtenerPorId(Long id) {
        return repository.findById(id).map(this::mapToDTO).orElse(null);
    }

    public UsuarioDTO crear(UsuarioDTO dto) {
        Usuario usuario = new Usuario(null, dto.getNombreCompleto(), dto.getNombreUsuario(), dto.getRol(), dto.getEstado());
        return mapToDTO(repository.save(usuario));
    }

    public UsuarioDTO actualizar(Long id, UsuarioDTO dto) {
        Usuario usuario = repository.findById(id).orElseThrow();
        usuario.setNombreCompleto(dto.getNombreCompleto());
        usuario.setNombreUsuario(dto.getNombreUsuario());
        usuario.setRol(dto.getRol());
        usuario.setEstado(dto.getEstado());
        return mapToDTO(repository.save(usuario));
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    private UsuarioDTO mapToDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNombreCompleto(usuario.getNombreCompleto());
        dto.setNombreUsuario(usuario.getNombreUsuario());
        dto.setRol(usuario.getRol());
        dto.setEstado(usuario.getEstado());
        return dto;
    }
}