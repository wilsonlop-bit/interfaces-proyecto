package com.example.proyecto.service;

import com.example.proyecto.dto.ProductoDTO;
import com.example.proyecto.exception.NotFoundException;
import com.example.proyecto.model.Producto;
import com.example.proyecto.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductoService {

    private final ProductoRepository repository;

    public ProductoService(ProductoRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void inicializarDatos() {
        if (repository.count() == 0) {
            repository.save(new Producto(null, "Balón Mikasa V200W", "Balón", 389900.0, 15));
            repository.save(new Producto(null, "Rodilleras Asics Gel", "Rodillera", 149900.0, 8));
            repository.save(new Producto(null, "Red profesional FIVB", "Red", 1299900.0, 5));
            System.out.println("Productos iniciales cargados con éxito.");
        }
    }

    public ProductoDTO crearProducto(ProductoDTO dto) {
        // Se agregan dto.getTipo() y dto.getCantidad() al constructor
        Producto producto = new Producto(null, dto.getNombre(), dto.getTipo(), dto.getPrecio(), dto.getCantidad());
        Producto guardado = repository.save(producto);
        return mapToDTO(guardado);
    }

    public List<ProductoDTO> obtenerTodos() {
        return repository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ProductoDTO obtenerPorId(Long id) {
        Producto producto = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con ID: " + id));
        return mapToDTO(producto);
    }

    public ProductoDTO actualizarProducto(Long id, ProductoDTO dto) {
        Producto existente = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con ID: " + id));

        existente.setNombre(dto.getNombre());
        existente.setTipo(dto.getTipo()); // Nuevo
        existente.setPrecio(dto.getPrecio());
        existente.setCantidad(dto.getCantidad()); // Nuevo

        repository.save(existente);
        return mapToDTO(existente);
    }

    public void eliminarProducto(Long id) {
        if (!repository.deleteById(id)) {
            throw new NotFoundException("Producto no encontrado con ID: " + id);
        }
    }

    private ProductoDTO mapToDTO(Producto producto) {
        ProductoDTO dto = new ProductoDTO();
        dto.setId(producto.getId());
        dto.setNombre(producto.getNombre());
        dto.setTipo(producto.getTipo()); // Nuevo
        dto.setPrecio(producto.getPrecio());
        dto.setCantidad(producto.getCantidad()); // Nuevo
        return dto;
    }
}