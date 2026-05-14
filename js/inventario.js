// 1. Definimos los 3 productos "quemados" (por defecto)
const productosPorDefecto = [
    { id: "1001", nombre: "Balón Mikasa V200W", deporte: "Voleibol", categoria: "Balones", marca: "Mikasa", precio: 85.00, stock: 15 },
    { id: "1002", nombre: "Zapatillas Asics Gel-Rocket", deporte: "Voleibol", categoria: "Calzado", marca: "Asics", precio: 120.00, stock: 8 },
    { id: "1003", nombre: "Rodilleras Mizuno T10", deporte: "Voleibol", categoria: "Accesorios", marca: "Mizuno", precio: 25.50, stock: 30 }
];

// 2. Cargar desde LocalStorage o usar los quemados si está vacío
let productos = JSON.parse(localStorage.getItem('sportstock_productos'));

if (!productos || productos.length === 0) {
    productos = productosPorDefecto;
    localStorage.setItem('sportstock_productos', JSON.stringify(productos));
}


const modal = document.getElementById('modalProducto');
const formProducto = document.getElementById('formProducto');
const tablaProductos = document.getElementById('tabla-productos');
const textoMostrando = document.getElementById('texto-mostrando');
const modalTitulo = document.getElementById('modalTitulo');


function abrirModal() {
    modal.style.display = 'flex';
    formProducto.reset();
    document.getElementById('productoId').value = '';
    modalTitulo.textContent = 'Agregar Nuevo Producto';
}


function editarProducto(id) {

    const producto = productos.find(p => p.id === id);

    if (producto) {
        document.getElementById('productoId').value = producto.id;
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('deporte').value = producto.deporte;
        document.getElementById('categoria').value = producto.categoria;
        document.getElementById('marca').value = producto.marca;
        document.getElementById('precio').value = producto.precio;
        document.getElementById('stock').value = producto.stock;

        // Cambiamos el título del modal
        modalTitulo.textContent = 'Editar Producto';

        // Mostramos el modal
        modal.style.display = 'flex';
    }
}

// Función para cerrar el modal
function cerrarModal() {
    modal.style.display = 'none';
}

// Evento: Al enviar el formulario (Click en "Guardar Producto")
formProducto.addEventListener('submit', function (e) {
    e.preventDefault();

    try {
        // 1. Buscamos los elementos en el HTML
        const inputId = document.getElementById('productoId');
        const inputNombre = document.getElementById('nombre');
        const inputDeporte = document.getElementById('deporte');
        const inputCategoria = document.getElementById('categoria');
        const inputMarca = document.getElementById('marca');
        const inputPrecio = document.getElementById('precio');
        const inputStock = document.getElementById('stock'); // ¡Ojo aquí!

        // 2. Verificamos si falta algún ID en tu HTML
        let idsFaltantes = [];
        if (!inputId) idsFaltantes.push("productoId (Asegúrate de tener un input oculto)");
        if (!inputNombre) idsFaltantes.push("nombre");
        if (!inputDeporte) idsFaltantes.push("deporte");
        if (!inputCategoria) idsFaltantes.push("categoria");
        if (!inputMarca) idsFaltantes.push("marca");
        if (!inputPrecio) idsFaltantes.push("precio");
        if (!inputStock) idsFaltantes.push("stock");

        if (idsFaltantes.length > 0) {
            alert("⚠️ Error en tu HTML. Faltan estos IDs: \n" + idsFaltantes.join("\n"));
            return;
        }

        // 3. Capturar los valores (ahora es seguro)
        const idActual = inputId.value;
        const nombre = inputNombre.value;
        const deporte = inputDeporte.value;
        const categoria = inputCategoria.value;
        const marca = inputMarca.value;
        const precio = parseFloat(inputPrecio.value) || 0;
        const stock = parseInt(inputStock.value) || 0;

        if (idActual) {
            // Editando
            const index = productos.findIndex(p => p.id === idActual);
            if (index !== -1) {
                productos[index] = { id: idActual, nombre, deporte, categoria, marca, precio, stock };
            }
        } else {
            // Creando nuevo
            const nuevoId = Date.now().toString();
            const nuevoProducto = { id: nuevoId, nombre, deporte, categoria, marca, precio, stock };
            productos.push(nuevoProducto);
        }

        // Guardar y refrescar
        localStorage.setItem('sportstock_productos', JSON.stringify(productos));
        cerrarModal();
        renderizarTabla();

    } catch (error) {
        console.error("Error al procesar el producto:", error);
        alert('Hubo un error interno: ' + error.message);
    }
});

// Función para dibujar la tabla
function renderizarTabla() {
    tablaProductos.innerHTML = '';

    productos.forEach(prod => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${prod.nombre}</td>
            <td>${prod.deporte}</td>
            <td>${prod.categoria}</td>
            <td>${prod.marca}</td>
            <td>$${prod.precio.toFixed(2)}</td>
            <td>${prod.stock}</td>
            <td>
            <button class="btn-action edit" onclick="editarProducto('${prod.id}')">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn-action delete" onclick="eliminarProducto('${prod.id}')">
                <i class="fas fa-trash"></i> Borrar
            </button>
        </td>
        `;
        tablaProductos.appendChild(tr);
    });

    // Actualizar el contador
    textoMostrando.textContent = `Mostrando ${productos.length} producto(s)`;
}

// Función para eliminar un producto
function eliminarProducto(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        productos = productos.filter(p => p.id !== id);
        localStorage.setItem('sportstock_productos', JSON.stringify(productos));
        renderizarTabla();
    }
}

// Cuando la página cargue, dibujamos la tabla
document.addEventListener('DOMContentLoaded', renderizarTabla);