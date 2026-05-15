package com.example.proyecto.controller;

import com.example.proyecto.dto.UsuarioDTO;
import com.example.proyecto.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {
    @Autowired
    private UsuarioService service;

    @GetMapping
    public List<UsuarioDTO> listar() {
        return service.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> obtener(@PathVariable Long id) {
        UsuarioDTO dto = service.obtenerPorId(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public UsuarioDTO crear(@RequestBody UsuarioDTO dto) {
        return service.crear(dto);
    }

    @PutMapping("/{id}")
    public UsuarioDTO actualizar(@PathVariable Long id, @RequestBody UsuarioDTO dto) {
        return service.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.ok().build();
    }

    // ==================== LOGIN ====================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        String nombreUsuario = credenciales.get("nombreUsuario");
        String password = credenciales.get("password");

        if (nombreUsuario == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuario y contraseña son requeridos"));
        }

        UsuarioDTO usuario = service.login(nombreUsuario, password);

        if (usuario != null) {
            return ResponseEntity.ok(usuario);
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "Usuario o contraseña incorrectos"));
        }
    }

    // ==================== REGISTRO ====================
    @PostMapping("/registro")
    public ResponseEntity<?> registro(@RequestBody UsuarioDTO dto) {
        if (dto.getNombreCompleto() == null || dto.getNombreUsuario() == null || dto.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Todos los campos son requeridos"));
        }

        // Verificar si el usuario ya existe
        List<UsuarioDTO> usuarios = service.obtenerTodos();
        boolean existe = usuarios.stream().anyMatch(u -> u.getNombreUsuario().equals(dto.getNombreUsuario()));

        if (existe) {
            return ResponseEntity.badRequest().body(Map.of("error", "El usuario ya existe"));
        }

        // Crear nuevo usuario
        UsuarioDTO nuevoUsuario = service.crear(dto);
        return ResponseEntity.ok(nuevoUsuario);
    }
}