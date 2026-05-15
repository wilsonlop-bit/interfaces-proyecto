// =============================================
//  SPORTSTOCK MANAGER - reportes.js
// =============================================

const API_PRODUCTOS = "http://localhost:8080/api/productos";

const hoy = new Date();
const fechaStr = hoy.toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric'
});

// ── INICIO ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    cargarSesion();

    const fechaHeader = document.getElementById('reportes-fecha');
    if (fechaHeader) {
        fechaHeader.textContent = hoy.toLocaleDateString('es-CO', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    }
    ['fecha-inv', 'fecha-ventas', 'fecha-stock'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = 'Generado: ' + fechaStr;
    });
});

// ── SESIÓN ────────────────────────────────────────────────
function cargarSesion() {
    const sesion = JSON.parse(sessionStorage.getItem("usuarioActivo") || "null");
    if (!sesion) {
        window.location.href = "login.html";
        return;
    }

    const iniciales = sesion.nombreCompleto.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase();
    document.getElementById("sesion-nombre").textContent = sesion.nombreCompleto;
    document.getElementById("sesion-rol").textContent    = sesion.rol;
    document.getElementById("sesion-avatar").textContent = iniciales;
    document.getElementById("saludo-nombre").textContent = sesion.nombreCompleto.split(" ")[0];
}

// ── OBTENER PRODUCTOS DEL BACKEND ────────────────────────
async function obtenerProductos() {
    const res = await fetch(API_PRODUCTOS);
    if (!res.ok) throw new Error("No se pudo conectar con el servidor");
    return await res.json();
}

// ── UTILIDADES PDF ────────────────────────────────────────
function crearDoc(titulo) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SportStock Manager', 14, 12);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(titulo, 14, 21);

    doc.setFontSize(9);
    doc.text(fechaStr, 196, 21, { align: 'right' });

    doc.setTextColor(30, 41, 59);
    return doc;
}

function guardar(doc, nombre) {
    doc.save(nombre + '_' + hoy.toISOString().slice(0, 10) + '.pdf');
}

function piePagina(doc) {
    const total = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`SportStock Manager © 2026  |  Página 1 de ${total}`, 105, 290, { align: 'center' });
}

// ── REPORTE 1: INVENTARIO GENERAL ────────────────────────
async function descargarInventario() {
    try {
        const productos = await obtenerProductos();
        if (productos.length === 0) { alert('No hay productos en el inventario.'); return; }

        const doc = crearDoc('Reporte de Inventario General');

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('Estado actual del inventario', 14, 40);

        const totalProductos = productos.length;
        const valorTotal     = productos.reduce((s, p) => s + ((p.precio || 0) * (p.stock || p.cantidad || 0)), 0);
        const bajosStock     = productos.filter(p => (p.stock || p.cantidad || 0) < 10).length;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`Total: ${totalProductos}   |   Valor: $${valorTotal.toLocaleString('es-CO')}   |   Bajo stock: ${bajosStock}`, 14, 48);
        doc.setTextColor(30, 41, 59);

        const filas = productos.map(p => {
            const stock = p.stock || p.cantidad || 0;
            return [
                p.nombre   || 'N/A',
                p.deporte  || p.tipo || 'N/A',
                p.categoria || 'N/A',
                p.marca    || 'N/A',
                '$' + Number(p.precio || 0).toLocaleString('es-CO'),
                stock,
                stock < 10 ? '⚠ Bajo' : 'OK'
            ];
        });

        doc.autoTable({
            startY: 55,
            head: [['Nombre', 'Deporte', 'Categoría', 'Marca', 'Precio', 'Stock', 'Estado']],
            body: filas,
            styles: { fontSize: 9, cellPadding: 4 },
            headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 6 && data.cell.raw === '⚠ Bajo') {
                    data.cell.styles.textColor = [239, 68, 68];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });

        piePagina(doc);
        guardar(doc, 'inventario_general');

    } catch (e) {
        alert('Error al generar el reporte: ' + e.message);
    }
}

// ── REPORTE 2: PRODUCTOS POR VALOR ───────────────────────
async function descargarMasVendidos() {
    try {
        const productos = await obtenerProductos();
        if (productos.length === 0) { alert('No hay productos en el inventario.'); return; }

        const doc = crearDoc('Análisis de Productos Más Vendidos');

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('Top productos por valor de inventario', 14, 40);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('Ordenado de mayor a menor valor total (precio × stock)', 14, 48);
        doc.setTextColor(30, 41, 59);

        const ordenados = [...productos]
            .map(p => ({ ...p, valorTotal: (p.precio || 0) * (p.stock || p.cantidad || 0) }))
            .sort((a, b) => b.valorTotal - a.valorTotal)
            .slice(0, 10);

        const filas = ordenados.map((p, i) => [
            i + 1,
            p.nombre || 'N/A',
            p.categoria || p.tipo || 'N/A',
            p.stock || p.cantidad || 0,
            '$' + Number(p.precio || 0).toLocaleString('es-CO'),
            '$' + Number(p.valorTotal).toLocaleString('es-CO')
        ]);

        doc.autoTable({
            startY: 55,
            head: [['#', 'Nombre', 'Categoría', 'Stock', 'Precio', 'Valor Total']],
            body: filas,
            styles: { fontSize: 9, cellPadding: 4 },
            headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: { 5: { fontStyle: 'bold', textColor: [16, 185, 129] } }
        });

        piePagina(doc);
        guardar(doc, 'productos_mas_vendidos');

    } catch (e) {
        alert('Error al generar el reporte: ' + e.message);
    }
}

// ── REPORTE 3: STOCK BAJO ─────────────────────────────────
async function descargarStockBajo() {
    try {
        const productos = await obtenerProductos();
        const bajos = productos.filter(p => (p.stock || p.cantidad || 0) < 10);

        if (bajos.length === 0) {
            alert('✅ No hay productos con stock bajo. ¡Todo está al día!');
            return;
        }

        const doc = crearDoc('Reporte de Stock Bajo');

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('Productos que requieren reabastecimiento', 14, 40);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(239, 68, 68);
        doc.text(`⚠  Se encontraron ${bajos.length} producto(s) con stock menor a 10 unidades.`, 14, 48);
        doc.setTextColor(30, 41, 59);

        const filas = bajos
            .sort((a, b) => (a.stock || a.cantidad || 0) - (b.stock || b.cantidad || 0))
            .map(p => {
                const stock = p.stock || p.cantidad || 0;
                return [
                    p.nombre    || 'N/A',
                    p.deporte   || p.tipo || 'N/A',
                    p.categoria || 'N/A',
                    p.marca     || 'N/A',
                    stock,
                    stock <= 3 ? 'CRÍTICO' : 'BAJO'
                ];
            });

        doc.autoTable({
            startY: 55,
            head: [['Nombre', 'Deporte', 'Categoría', 'Marca', 'Stock', 'Alerta']],
            body: filas,
            styles: { fontSize: 9, cellPadding: 4 },
            headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [255, 241, 242] },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 5) {
                    data.cell.styles.textColor = data.cell.raw === 'CRÍTICO' ? [185, 28, 28] : [217, 119, 6];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });

        piePagina(doc);
        guardar(doc, 'reporte_stock_bajo');

    } catch (e) {
        alert('Error al generar el reporte: ' + e.message);
    }
}