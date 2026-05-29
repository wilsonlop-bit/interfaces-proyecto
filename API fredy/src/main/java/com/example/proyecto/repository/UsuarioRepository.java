package com.example.proyecto.repository;

import com.example.proyecto.model.Usuario;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class UsuarioRepository {

    private static final String RUTA_JSON = "usuarios.json";
    private final ObjectMapper mapper = new ObjectMapper();

    private List<Usuario> usuarios = new ArrayList<>();
    private Long contadorId = 1L;

    public UsuarioRepository() {
        cargarDesdeJSON();
    }

    // ── Carga los usuarios desde el archivo JSON al iniciar ──
    private void cargarDesdeJSON() {
        File archivo = new File(RUTA_JSON);
        if (archivo.exists()) {
            try {
                usuarios = mapper.readValue(archivo, new TypeReference<List<Usuario>>() {});
                // Ajustar el contador para que no repita IDs
                contadorId = usuarios.stream()
                        .mapToLong(u -> u.getId() != null ? u.getId() : 0L)
                        .max()
                        .orElse(0L) + 1;
                System.out.println("✅ Usuarios cargados desde " + RUTA_JSON);
            } catch (IOException e) {
                System.err.println("⚠ No se pudo leer " + RUTA_JSON + ": " + e.getMessage());
                usuarios = new ArrayList<>();
            }
        }
    }

    // ── Guarda la lista completa en el archivo JSON ──
    private void guardarEnJSON() {
        try {
            mapper.writerWithDefaultPrettyPrinter().writeValue(new File(RUTA_JSON), usuarios);
        } catch (IOException e) {
            System.err.println("⚠ No se pudo guardar en " + RUTA_JSON + ": " + e.getMessage());
        }
    }

    // ── CRUD ─────────────────────────────────────────────────

    public long count() {
        return usuarios.size();
    }

    public Usuario save(Usuario usuario) {
        if (usuario.getId() == null) {
            usuario.setId(contadorId++);
            usuarios.add(usuario);
        } else {
            for (int i = 0; i < usuarios.size(); i++) {
                if (usuarios.get(i).getId().equals(usuario.getId())) {
                    usuarios.set(i, usuario);
                    break;
                }
            }
        }
        guardarEnJSON(); // ← Persiste al JSON después de cada cambio
        return usuario;
    }

    public List<Usuario> findAll() {
        return usuarios;
    }

    public Optional<Usuario> findById(Long id) {
        return usuarios.stream().filter(u -> u.getId().equals(id)).findFirst();
    }

    public void deleteById(Long id) {
        usuarios.removeIf(u -> u.getId().equals(id));
        guardarEnJSON(); // ← Persiste al JSON después de eliminar
    }
}