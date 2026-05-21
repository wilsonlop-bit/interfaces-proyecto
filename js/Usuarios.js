// =============================================
//  SPORTSTOCK - inventario.js
// =============================================

const API_URL_PRODUCTOS = "http://localhost:8080/api/productos";
let productos = [];
let productoEditando = null;

const modal = document.getElementById('modalProducto');
const formProducto = document.getElementById('formProducto');
const tablaProductos = document.getElementById('tabla-productos');
const textoMostrando = document.getElementById('texto-mostrando');

document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión e inicializar header (nombre, rol, avatar)
    inicializarHeader();

    // Si es Empleado: ocultar botón "Nuevo Producto"
    if (!esAdmin()) {
        const btnNuevo = document.querySelector(".btn-add");
        if (btnNuevo) btnNuevo.style.display = "none";
    }

    cargarProductosAPI();
});

// ── CARGAR PRODUCTOS ───────────────────────────────────
async function cargarProductosAPI() {
    try {
        const response = await fetch(API_URL_PRODUCTOS);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        productos = await response.json();
        renderizarTabla();
    } catch (error) {
        console.error("Error al cargar productos:", error);
        mostrarError("No se pudo conectar con el servidor. Verifica que Java esté corriendo en localhost:8080");
    }
}

function mostrarError(mensaje) {
    tablaProductos.innerHTML = `
        <tr>
            <td colspan="7" style="text-align:center; padding:40px; color:#ef4444;">
                <i class="fas fa-exclamation-circle" style="font-size:30px; margin-bottom:10px; display:block;"></i>
                <strong>${mensaje}</strong>
            </td>
        </tr>`;
    textoMostrando.textContent = "Error al cargar productos";
}

// ── MODAL ───────────────────────────────────────────────
function abrirModal() {
    if (!esAdmin()) { alert("No tienes permisos para agregar productos."); return; }
    productoEditando = null;
    formProducto.reset();
    document.getElementById('productoId').value = '';
    document.getElementById('modalTitulo').textContent = 'Agregar Nuevo Producto';
    modal.style.display = 'flex';
}

function cerrarModal() {
    modal.style.display = 'none';
}

// ── EDITAR ──────────────────────────────────────────────
function editarProducto(id) {
    if (!esAdmin()) { alert("No tienes permisos para editar productos."); return; }
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

// ── GUARDAR ─────────────────────────────────────────────
formProducto.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!esAdmin()) { alert("No tienes permisos para esta acción."); return; }

    const id = document.getElementById('productoId').value;
    const datosProducto = {
        nombre: document.getElementById('nombre').value.trim(),
        deporte: document.getElementById('deporte').value.trim(),
        categoria: document.getElementById('categoria').value,
        marca: document.getElementById('marca').value.trim(),
        precio: parseFloat(document.getElementById('precio').value),
        stock: parseInt(document.getElementById('stock').value)
    };

    try {
        const url = id ? `${API_URL_PRODUCTOS}/${id}` : API_URL_PRODUCTOS;
        const method = id ? "PUT" : "POST";
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosProducto)
        });
        if (!response.ok) throw new Error("Error al guardar");
        cerrarModal();
        cargarProductosAPI();
        alert(id ? "Producto actualizado correctamente" : "Producto creado correctamente");
    } catch (error) {
        alert("Error al guardar el producto: " + error.message);
    }
});

// ── ELIMINAR ────────────────────────────────────────────
async function eliminarProducto(id) {
    if (!esAdmin()) { alert("No tienes permisos para eliminar productos."); return; }
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    try {
        const response = await fetch(`${API_URL_PRODUCTOS}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Error al eliminar");
        cargarProductosAPI();
        alert("Producto eliminado correctamente");
    } catch (error) {
        alert("Error al eliminar el producto: " + error.message);
    }
}

// ── RENDERIZAR TABLA ───────────────────────────────────
function renderizarTabla() {
    if (productos.length === 0) {
        tablaProductos.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:40px; color:#94a3b8;">
                    <i class="fas fa-inbox" style="font-size:30px; margin-bottom:10px; display:block;"></i>
                    No hay productos que mostrar
                </td>
            </tr>`;
        textoMostrando.textContent = "Mostrando 0 productos";
        return;
    }

    const admin = esAdmin();

    tablaProductos.innerHTML = productos.map(p => {
        const stock = p.stock || p.cantidad || 0;
        const stockClass = stock < 10 ? "verylow" : "high";
        const precio = p.precio || 0;

        const acciones = admin
            ? `<button class="btn-action edit" onclick="editarProducto(${p.id})">
                   <i class="fas fa-edit"></i> Editar
               </button>
               <button class="btn-action delete" onclick="eliminarProducto(${p.id})">
                   <i class="fas fa-trash"></i> Eliminar
               </button>`
            : `<span style="color:#94a3b8; font-size:13px;">
                   <i class="fas fa-lock"></i> Solo lectura
               </span>`;

        return `
        <tr>
            <td>${p.nombre || 'N/A'}</td>
            <td>${p.deporte || 'N/A'}</td>
            <td>${p.categoria || 'N/A'}</td>
            <td>${p.marca || 'N/A'}</td>
            <td>$${Number(precio).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
            <td><span class="stock ${stockClass}">${stock}</span></td>
            <td>${acciones}</td>
        </tr>`;
    }).join('');

    textoMostrando.textContent = `Mostrando ${productos.length} producto(s)`;
}