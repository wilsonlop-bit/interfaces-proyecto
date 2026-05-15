// =============================================
//  SPORTSTOCK - dashboard.js (Conectado a API)
// =============================================

const API_URL_PRODUCTOS = "http://localhost:8080/api/productos";
const API_URL_USUARIOS = "http://localhost:8080/api/usuarios";

document.addEventListener('DOMContentLoaded', () => {
    // Fecha dinámica
    const fechaEl = document.getElementById('dash-fecha');
    if (fechaEl) {
        fechaEl.textContent = new Date().toLocaleDateString('es-CO', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    // Cargar datos desde la API
    cargarDatos();
});

// ── CARGAR TODOS LOS DATOS ─────────────────────────────
async function cargarDatos() {
    try {
        // Cargar productos
        const resProductos = await fetch(API_URL_PRODUCTOS);
        if (!resProductos.ok) throw new Error("Error cargando productos");
        const productos = await resProductos.json();

        // Cargar usuarios
        const resUsuarios = await fetch(API_URL_USUARIOS);
        if (!resUsuarios.ok) throw new Error("Error cargando usuarios");
        const usuarios = await resUsuarios.json();

        // Actualizar tarjetas
        actualizarTarjetas(productos, usuarios);

        // Actualizar paneles
        actualizarActividadReciente(productos);
        actualizarAlertasStock(productos);

    } catch (error) {
        console.error("Error cargando datos:", error);
        mostrarErrorDashboard();
    }
}

// ── ACTUALIZAR TARJETAS SUPERIORES ─────────────────────
function actualizarTarjetas(productos, usuarios) {
    const stockMin = 10;
    const bajosStock = productos.filter(p => (p.stock || p.cantidad || 0) < stockMin).length;
    const valorInventario = productos.reduce((suma, p) => {
        const stock = p.stock || p.cantidad || 0;
        const precio = p.precio || 0;
        return suma + (precio * stock);
    }, 0);

    // Total productos
    const elTotal = document.getElementById('dash-total-productos');
    if (elTotal) elTotal.textContent = productos.length;

    // Stock bajo
    const elBajos = document.getElementById('dash-bajos-stock');
    if (elBajos) elBajos.textContent = bajosStock;

    // Valor inventario
    const elValor = document.getElementById('dash-valor-total');
    if (elValor) elValor.textContent = '$ ' + valorInventario.toLocaleString('es-CO', {minimumFractionDigits: 2});
}

// ── ACTIVIDAD RECIENTE ─────────────────────────────────
function actualizarActividadReciente(productos) {
    const contenedor = document.getElementById('dash-actividad-reciente');
    if (!contenedor) return;

    if (productos.length === 0) {
        contenedor.innerHTML = '<p style="color:#94a3b8; text-align:center; padding:20px;">No hay productos registrados</p>';
        return;
    }

    // Mostrar los últimos 5 productos
    contenedor.innerHTML = [...productos].reverse().slice(0, 5).map(p => `
        <div style="display:flex; justify-content:space-between; align-items:center; 
                    padding:12px 0; border-bottom:1px solid #f1f5f9;">
            <div style="display:flex; align-items:center; gap:15px;">
                <div style="background:#eef2ff; color:#4f46e5; width:40px; height:40px; 
                            display:flex; justify-content:center; align-items:center; border-radius:8px; flex-shrink:0;">
                    <i class="fas fa-box"></i>
                </div>
                <div>
                    <h4 style="margin:0; font-size:14px; color:#1e293b;">${p.nombre || 'Producto'}</h4>
                    <p style="margin:0; font-size:12px; color:#64748b;">${p.categoria || p.deporte || 'Sin categoría'}</p>
                </div>
            </div>
            <span style="color:${(p.stock || 0) < 10 ? '#ef4444' : '#10b981'}; font-size:13px; font-weight:bold;">
                Stock: ${p.stock || p.cantidad || 0}
            </span>
        </div>
    `).join('');
}

// ── ALERTAS DE STOCK BAJO ──────────────────────────────
function actualizarAlertasStock(productos) {
    const contenedor = document.getElementById('dash-alertas-stock');
    if (!contenedor) return;

    const bajosStock = productos.filter(p => (p.stock || p.cantidad || 0) < 10);

    if (bajosStock.length === 0) {
        contenedor.innerHTML = '<p style="color:#10b981; padding:10px; text-align:center;">✅ Stock al día - No hay alertas</p>';
        return;
    }

    contenedor.innerHTML = bajosStock.map(p => {
        const stock = p.stock || p.cantidad || 0;
        return `
        <div style="display:flex; justify-content:space-between; align-items:center; 
                    background:#fff1f2; padding:10px; border-radius:8px; margin-bottom:8px;">
            <div style="flex: 1;">
                <h4 style="margin:0; font-size:13px; color:#1e293b;">${p.nombre}</h4>
                <p style="margin:2px 0 0 0; font-size:11px; color:#64748b;">${p.marca || p.deporte || 'Sin marca'}</p>
            </div>
            <span style="background:#ef4444; color:white; padding:4px 10px; 
                         border-radius:10px; font-size:11px; font-weight:bold; white-space:nowrap; margin-left:10px;">
                ${stock} un.
            </span>
        </div>`;
    }).join('');
}

// ── MOSTRAR ERROR EN DASHBOARD ─────────────────────────
function mostrarErrorDashboard() {
    const elTotal = document.getElementById('dash-total-productos');
    const elBajos = document.getElementById('dash-bajos-stock');
    const elValor = document.getElementById('dash-valor-total');

    if (elTotal) elTotal.textContent = '—';
    if (elBajos) elBajos.textContent = '—';
    if (elValor) elValor.textContent = '—';

    const contenedorActividad = document.getElementById('dash-actividad-reciente');
    if (contenedorActividad) {
        contenedorActividad.innerHTML = `
            <div style="text-align:center; padding:20px; color:#ef4444;">
                <i class="fas fa-exclamation-circle" style="font-size:24px; margin-bottom:10px; display:block;"></i>
                <p><strong>Error de conexión</strong></p>
                <p style="font-size:12px; margin:0;">Verifica que Java esté corriendo en localhost:8080</p>
            </div>
        `;
    }

    const contenedorAlertas = document.getElementById('dash-alertas-stock');
    if (contenedorAlertas) {
        contenedorAlertas.innerHTML = `
            <div style="text-align:center; padding:20px; color:#ef4444;">
                <p style="font-size:12px; margin:0;">No se pudo cargar la información</p>
            </div>
        `;
    }
}

