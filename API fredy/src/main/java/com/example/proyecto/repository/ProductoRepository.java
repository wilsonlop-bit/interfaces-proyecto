package com.example.proyecto.repository;

import com.example.proyecto.model.Producto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class ProductoRepository {

    private static final String RUTA_JSON = "productos.json";
    private final ObjectMapper mapper = new ObjectMapper();

    private List<Producto> productos = new ArrayList<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    public ProductoRepository() {
        cargarDesdeJSON();
    }

    // ── Carga los productos desde el archivo JSON al iniciar ──
    private void cargarDesdeJSON() {
        File archivo = new File(RUTA_JSON);
        if (archivo.exists()) {
            try {
                productos = mapper.readValue(archivo, new TypeReference<List<Producto>>() {});
                // Ajustar el contador para que no repita IDs
                long maxId = productos.stream()
                        .mapToLong(p -> p.getId() != null ? p.getId() : 0L)
                        .max()
                        .orElse(0L);
                idGenerator.set(maxId + 1);
                System.out.println("✅ Productos cargados desde " + RUTA_JSON);
            } catch (IOException e) {
                System.err.println("⚠ No se pudo leer " + RUTA_JSON + ": " + e.getMessage());
                productos = new ArrayList<>();
            }
        }
    }

    // ── Guarda la lista completa en el archivo JSON ──
    private void guardarEnJSON() {
        try {
            mapper.writerWithDefaultPrettyPrinter().writeValue(new File(RUTA_JSON), productos);
        } catch (IOException e) {
            System.err.println("⚠ No se pudo guardar en " + RUTA_JSON + ": " + e.getMessage());
        }
    }

    // ── CRUD ─────────────────────────────────────────────────

    public Producto save(Producto producto) {
        if (producto.getId() == null) {
            producto.setId(idGenerator.getAndIncrement());
            productos.add(producto);
        } else {
            for (int i = 0; i < productos.size(); i++) {
                if (productos.get(i).getId().equals(producto.getId())) {
                    productos.set(i, producto);
                    break;
                }
            }
        }
        guardarEnJSON(); // ← Persiste al JSON después de cada cambio
        return producto;
    }

    public Optional<Producto> findById(Long id) {
        return productos.stream().filter(p -> p.getId().equals(id)).findFirst();
    }

    public List<Producto> findAll() {
        return new ArrayList<>(productos);
    }

    public boolean deleteById(Long id) {
        boolean eliminado = productos.removeIf(p -> p.getId().equals(id));
        if (eliminado) {
            guardarEnJSON(); // ← Persiste al JSON después de eliminar
        }
        return eliminado;
    }

    public long count() {
        return productos.size();
    }
}