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

    }

    public List<UsuarioDTO> obtenerTodos() {
        return repository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public UsuarioDTO obtenerPorId(Long id) {
        return repository.findById(id).map(this::mapToDTO).orElse(null);
    }

    public UsuarioDTO crear(UsuarioDTO dto) {
        Usuario usuario = new Usuario(
                null,
                dto.getNombreCompleto(),
                dto.getNombreUsuario(),
                dto.getPassword(),
                dto.getRol() != null ? dto.getRol() : "Empleado",
                dto.getEstado() != null ? dto.getEstado() : "Activo"
        );
        return mapToDTO(repository.save(usuario));
    }

    public UsuarioDTO actualizar(Long id, UsuarioDTO dto) {
        Usuario usuario = repository.findById(id).orElseThrow();
        usuario.setNombreCompleto(dto.getNombreCompleto());
        usuario.setNombreUsuario(dto.getNombreUsuario());
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            usuario.setPassword(dto.getPassword());
        }
        usuario.setRol(dto.getRol());
        usuario.setEstado(dto.getEstado());
        return mapToDTO(repository.save(usuario));
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    // ==================== LOGIN ====================
    // Método para autenticar usuario
    public UsuarioDTO login(String nombreUsuario, String password) {
        return repository.findAll().stream()
                .filter(u -> u.getNombreUsuario().equals(nombreUsuario) && u.getPassword().equals(password))
                .map(this::mapToDTO)
                .findFirst()
                .orElse(null);
    }

    // Mapeo de Usuario a UsuarioDTO
    private UsuarioDTO mapToDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNombreCompleto(usuario.getNombreCompleto());
        dto.setNombreUsuario(usuario.getNombreUsuario());
        dto.setPassword(usuario.getPassword());
        dto.setRol(usuario.getRol());
        dto.setEstado(usuario.getEstado());
        return dto;
    }
}