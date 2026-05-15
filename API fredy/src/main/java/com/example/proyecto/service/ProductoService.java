package com.example.proyecto.service;

import com.example.proyecto.dto.ProductoDTO;
import com.example.proyecto.model.Producto;
import com.example.proyecto.repository.ProductoRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductoService {
    @Autowired
    private ProductoRepository repository;

    @PostConstruct
    public void inicializarDatos() {
        if (repository.count() == 0) {
            repository.save(new Producto(null, "Balón Mikasa V200W", "Voleibol", "Balones", "Mikasa", 85.00, 15));
            repository.save(new Producto(null, "Zapatillas Asics Gel-Rocket", "Voleibol", "Calzado", "Asics", 120.00, 8));
            repository.save(new Producto(null, "Rodilleras Mizuno T10", "Voleibol", "Accesorios", "Mizuno", 25.50, 30));
            System.out.println("Productos iniciales cargados con éxito.");
        }
    }

    public List<ProductoDTO> obtenerTodos() {
        return repository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public ProductoDTO obtenerPorId(Long id) {
        return repository.findById(id).map(this::mapToDTO).orElse(null);
    }

    public ProductoDTO crear(ProductoDTO dto) {
        Producto producto = new Producto(
                null,
                dto.getNombre(),
                dto.getDeporte(),
                dto.getCategoria(),
                dto.getMarca(),
                dto.getPrecio(),
                dto.getStock()
        );
        return mapToDTO(repository.save(producto));
    }

    public ProductoDTO actualizar(Long id, ProductoDTO dto) {
        Producto producto = repository.findById(id).orElseThrow();
        producto.setNombre(dto.getNombre());
        producto.setDeporte(dto.getDeporte());
        producto.setCategoria(dto.getCategoria());
        producto.setMarca(dto.getMarca());
        producto.setPrecio(dto.getPrecio());
        producto.setStock(dto.getStock());
        return mapToDTO(repository.save(producto));
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    private ProductoDTO mapToDTO(Producto producto) {
        ProductoDTO dto = new ProductoDTO();
        dto.setId(producto.getId());
        dto.setNombre(producto.getNombre());
        dto.setDeporte(producto.getDeporte());
        dto.setCategoria(producto.getCategoria());
        dto.setMarca(producto.getMarca());
        dto.setPrecio(producto.getPrecio());
        dto.setStock(producto.getStock());
        return dto;
    }
}