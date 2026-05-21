// =============================================
//  SPORTSTOCK - Reportes.js
// =============================================

const API_URL_PRODUCTOS = "http://localhost:8080/api/productos";

const hoy = new Date();
const fechaStr = hoy.toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric'
});

document.addEventListener('DOMContentLoaded', () => {
    inicializarHeader();

    ['fecha-inv', 'fecha-ventas', 'fecha-stock'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = 'Generado: ' + fechaStr;
    });
});

// ── Cargar productos desde la API ──────────────────────
async function obtenerProductos() {
    try {
        const res = await fetch(API_URL_PRODUCTOS);
        if (!res.ok) throw new Error("Error");
        return await res.json();
    } catch (error) {
        alert("No se pudo conectar con el servidor. Verifica que Java esté corriendo en localhost:8080");
        return [];
    }
}

// ── UTILIDADES PDF ──────────────────────────────────────
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

// ── REPORTE 1: INVENTARIO GENERAL ──────────────────────
async function descargarInventario() {
    const productos = await obtenerProductos();
    if (productos.length === 0) return;

    const doc = crearDoc('Reporte de Inventario General');

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Estado actual del inventario por categorías', 14, 40);

    const valorTotal = productos.reduce((s, p) => s + ((p.precio || 0) * (p.stock || p.cantidad || 0)), 0);
    const bajosStock = productos.filter(p => (p.stock || p.cantidad || 0) < 10).length;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Total: ${productos.length}   |   Valor: $${valorTotal.toLocaleString('es-CO')}   |   Bajo stock: ${bajosStock}`, 14, 48);
    doc.setTextColor(30, 41, 59);

    const filas = productos.map(p => {
        const stock = p.stock || p.cantidad || 0;
        return [p.nombre || '', p.deporte || '', p.categoria || '', p.marca || '',
            '$' + Number(p.precio || 0).toLocaleString('es-CO'), stock, stock < 10 ? '⚠ Bajo' : 'OK'];
    });

    doc.autoTable({
        startY: 55,
        head: [['Nombre', 'Deporte', 'Categoría', 'Marca', 'Precio', 'Stock', 'Estado']],
        body: filas,
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`SportStock Manager © 2026  |  Página 1 de ${doc.internal.getNumberOfPages()}`, 105, 290, { align: 'center' });
    guardar(doc, 'inventario_general');
}

// ── REPORTE 2: MÁS VENDIDOS ────────────────────────────
async function descargarMasVendidos() {
    const productos = await obtenerProductos();
    if (productos.length === 0) return;

    const doc = crearDoc('Análisis de Productos Más Vendidos');

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Top productos por valor de inventario', 14, 40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Ordenado de mayor a menor valor total (precio × stock)', 14, 48);
    doc.setTextColor(30, 41, 59);

    const filas = [...productos]
        .map(p => ({ ...p, valorTotal: (p.precio || 0) * (p.stock || p.cantidad || 0) }))
        .sort((a, b) => b.valorTotal - a.valorTotal)
        .slice(0, 10)
        .map((p, i) => [i + 1, p.nombre || '', p.categoria || '', p.stock || p.cantidad || 0,
            '$' + Number(p.precio || 0).toLocaleString('es-CO'),
            '$' + Number(p.valorTotal).toLocaleString('es-CO')]);

    doc.autoTable({
        startY: 55,
        head: [['#', 'Nombre', 'Categoría', 'Stock', 'Precio', 'Valor Total']],
        body: filas,
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 5: { fontStyle: 'bold', textColor: [16, 185, 129] } }
    });

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`SportStock Manager © 2026  |  Página 1 de ${doc.internal.getNumberOfPages()}`, 105, 290, { align: 'center' });
    guardar(doc, 'productos_mas_vendidos');
}

// ── REPORTE 3: STOCK BAJO ───────────────────────────────
async function descargarStockBajo() {
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
            return [p.nombre || '', p.deporte || '', p.categoria || '', p.marca || '',
                stock, stock <= 3 ? 'CRÍTICO' : 'BAJO'];
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

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`SportStock Manager © 2026  |  Página 1 de ${doc.internal.getNumberOfPages()}`, 105, 290, { align: 'center' });
    guardar(doc, 'reporte_stock_bajo');
}