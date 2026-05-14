package com.example.proyecto.repository;

import com.example.proyecto.model.Usuario;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class UsuarioRepository {

    private List<Usuario> usuarios = new ArrayList<>();
    private Long contadorId = 1L;

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
    }
}