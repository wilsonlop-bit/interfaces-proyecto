package com.example.proyecto.dto;

public class ProductoDTO {
    private Long id;
    private String nombre;
    private String deporte;
    private String categoria;
    private String marca;
    private Double precio;
    private Integer stock;

    public ProductoDTO() {}

    public ProductoDTO(Long id, String nombre, String deporte, String categoria, String marca, Double precio, Integer stock) {
        this.id = id;
        this.nombre = nombre;
        this.deporte = deporte;
        this.categoria = categoria;
        this.marca = marca;
        this.precio = precio;
        this.stock = stock;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDeporte() { return deporte; }
    public void setDeporte(String deporte) { this.deporte = deporte; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
}