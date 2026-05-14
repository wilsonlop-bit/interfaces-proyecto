package com.example.proyecto.repository;

import com.example.proyecto.model.Producto;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class ProductoRepository {
    private final Map<Long, Producto> productos = new HashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    public Producto save(Producto producto) {
        if (producto.getId() == null) {
            producto.setId(idGenerator.getAndIncrement());
        }
        productos.put(producto.getId(), producto);
        return producto;
    }

    public Optional<Producto> findById(Long id) {
        return Optional.ofNullable(productos.get(id));
    }

    public List<Producto> findAll() {
        return new ArrayList<>(productos.values());
    }

    public boolean deleteById(Long id) {
        return productos.remove(id) != null;
    }

    public long count() {
        return productos.size();
    }
}