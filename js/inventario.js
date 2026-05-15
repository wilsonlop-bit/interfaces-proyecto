// =============================================
//  SPORTSTOCK - inventario.js (Conectado a API)
// =============================================

const API_URL_PRODUCTOS = "http://localhost:8080/api/productos";
let productos = [];
let productoEditando = null;

// Referencias al DOM
const modal = document.getElementById('modalProducto');
const formProducto = document.getElementById('formProducto');
const tablaProductos = document.getElementById('tabla-productos');
const textoMostrando = document.getElementById('texto-mostrando');

// ── CARGAR PRODUCTOS DESDE API ─────────────────────────
async function cargarProductosAPI() {
    try {
        const response = await fetch(API_URL_PRODUCTOS);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudieron cargar los productos`);
        }

        productos = await response.json();
        renderizarTabla();

    } catch (error) {
        console.error("Error al cargar productos:", error);
        mostrarError("No se pudo conectar con el servidor. Verifica que Java esté corriendo en localhost:8080");
    }
}

// ── MOSTRAR ERROR ───────────────────────────────────────
function mostrarError(mensaje) {
    tablaProductos.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; padding: 40px; color: #ef4444;">
                <i class="fas fa-exclamation-circle" style="font-size: 30px; margin-bottom: 10px; display: block;"></i>
                <strong>${mensaje}</strong>
            </td>
        </tr>
    `;
    textoMostrando.textContent = "Error al cargar productos";
}

// ── MODAL ───────────────────────────────────────────────
function abrirModal() {
    productoEditando = null;
    formProducto.reset();
    document.getElementById('productoId').value = '';
    document.getElementById('modalTitulo').textContent = 'Agregar Nuevo Producto';
    modal.style.display = 'flex';
}

function cerrarModal() {
    modal.style.display = 'none';
}

// ── EDITAR PRODUCTO ────────────────────────────────────
function editarProducto(id) {
    const p = productos.find(p => p.id === id);
    if (!p) return;

    productoEditando = id;
    document.getElementById('productoId').value = p.id;
    document.getElementById('nombre').value = p.nombre;
    document.getElementById('deporte').value = p.deporte;
    document.getElementById('categoria').value = p.categoria;
    document.getElementById('marca').value = p.marca;
    document.getElementById('precio').value = p.precio;
    document.getElementById('stock').value = p.stock;
    document.getElementById('modalTitulo').textContent = 'Editar Producto';
    modal.style.display = 'flex';
}

// ── GUARDAR PRODUCTO (CREAR O EDITAR) ──────────────────
formProducto.addEventListener('submit', async function(e) {
    e.preventDefault();

    const id = document.getElementById('productoId').value;
    const nombre = document.getElementById('nombre').value.trim();
    const deporte = document.getElementById('deporte').value.trim();
    const categoria = document.getElementById('categoria').value;
    const marca = document.getElementById('marca').value.trim();
    const precio = parseFloat(document.getElementById('precio').value);
    const stock = parseInt(document.getElementById('stock').value);

    if (!nombre || !deporte || !categoria || !marca || !precio || stock === '') {
        alert("Por favor completa todos los campos");
        return;
    }

    const datosProducto = {
        nombre: nombre,
        deporte: deporte,
        categoria: categoria,
        marca: marca,
        precio: precio,
        stock: stock
    };

    try {
        let response;

        if (id) {
            // EDITAR
            response = await fetch(`${API_URL_PRODUCTOS}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosProducto)
            });
        } else {
            // CREAR
            response = await fetch(API_URL_PRODUCTOS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosProducto)
            });
        }

        if (!response.ok) {
            throw new Error("Error al guardar el producto");
        }

        cerrarModal();
        cargarProductosAPI(); // Recargar tabla
        alert(id ? "Producto actualizado correctamente" : "Producto creado correctamente");

    } catch (error) {
        console.error("Error:", error);
        alert("Error al guardar el producto: " + error.message);
    }
});

// ── ELIMINAR PRODUCTO ──────────────────────────────────
async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    try {
        const response = await fetch(`${API_URL_PRODUCTOS}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Error al eliminar el producto");
        }

        cargarProductosAPI(); // Recargar tabla
        alert("Producto eliminado correctamente");

    } catch (error) {
        console.error("Error:", error);
        alert("Error al eliminar el producto: " + error.message);
    }
}

// ── RENDERIZAR TABLA ───────────────────────────────────
function renderizarTabla() {
    if (productos.length === 0) {
        tablaProductos.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #94a3b8;">
                    <i class="fas fa-inbox" style="font-size: 30px; margin-bottom: 10px; display: block;"></i>
                    No hay productos que mostrar
                </td>
            </tr>
        `;
        textoMostrando.textContent = "Mostrando 0 productos";
        return;
    }

    tablaProductos.innerHTML = productos.map(p => {
        const stock = p.stock || p.cantidad || 0;  // Compatibilidad con ambos nombres
        const stockClass = stock < 10 ? "verylow" : "high";
        const precio = p.precio || 0;

        return `
        <tr>
            <td>${p.nombre || 'N/A'}</td>
            <td>${p.deporte || 'N/A'}</td>
            <td>${p.categoria || 'N/A'}</td>
            <td>${p.marca || 'N/A'}</td>
            <td>$${Number(precio).toLocaleString('es-CO', {minimumFractionDigits: 2})}</td>
            <td><span class="stock ${stockClass}">${stock}</span></td>
            <td>
                <button class="btn-action edit" onclick="editarProducto(${p.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-action delete" onclick="eliminarProducto(${p.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        </tr>`;
    }).join('');

    textoMostrando.textContent = `Mostrando ${productos.length} producto(s)`;
}

// ── INICIALIZAR CUANDO LA PÁGINA CARGA ─────────────────
document.addEventListener('DOMContentLoaded', () => {
    cargarProductosAPI();
});

