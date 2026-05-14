// =============================================
//  SPORTSTOCK - reportes.js
// =============================================

const hoy = new Date();
const fechaStr = hoy.toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric'
});

// Fecha dinámica en header y tarjetas
document.addEventListener('DOMContentLoaded', () => {
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

// ── UTILIDADES PDF ──────────────────────────────────────
function crearDoc(titulo) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Encabezado verde
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SportStock Manager', 14, 12);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(titulo, 14, 21);

    // Fecha a la derecha
    doc.setFontSize(9);
    doc.text(fechaStr, 196, 21, { align: 'right' });

    // Resetear color de texto
    doc.setTextColor(30, 41, 59);
    return doc;
}

function guardar(doc, nombre) {
    doc.save(nombre + '_' + hoy.toISOString().slice(0, 10) + '.pdf');
}

// ── REPORTE 1: INVENTARIO GENERAL ──────────────────────
function descargarInventario() {
    const productos = JSON.parse(localStorage.getItem('sportstock_productos')) || [];

    if (productos.length === 0) {
        alert('No hay productos en el inventario.');
        return;
    }

    const doc = crearDoc('Reporte de Inventario General');

    // Subtítulo
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Estado actual del inventario por categorías', 14, 40);

    // Resumen
    const totalProductos = productos.length;
    const valorTotal = productos.reduce((s, p) => s + (p.precio * p.stock), 0);
    const bajosStock  = productos.filter(p => p.stock < 10).length;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Total productos: ${totalProductos}   |   Valor inventario: $${valorTotal.toLocaleString('es-CO')}   |   Bajo stock: ${bajosStock}`, 14, 48);
    doc.setTextColor(30, 41, 59);

    // Tabla
    const filas = productos.map(p => [
        p.nombre,
        p.deporte,
        p.categoria,
        p.marca,
        '$' + Number(p.precio).toLocaleString('es-CO'),
        p.stock,
        p.stock < 10 ? '⚠ Bajo' : 'OK'
    ]);

    doc.autoTable({
        startY: 55,
        head: [['Nombre', 'Deporte', 'Categoría', 'Marca', 'Precio', 'Stock', 'Estado']],
        body: filas,
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didDrawCell: (data) => {
            // Colorear "⚠ Bajo" en rojo
            if (data.section === 'body' && data.column.index === 6) {
                if (data.cell.raw === '⚠ Bajo') {
                    data.cell.styles.textColor = [239, 68, 68];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        }
    });

    // Pie
    const totalPags = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`SportStock Manager © 2026  |  Página 1 de ${totalPags}`, 105, 290, { align: 'center' });

    guardar(doc, 'inventario_general');
}

// ── REPORTE 2: PRODUCTOS MÁS VENDIDOS (por valor) ──────
function descargarMasVendidos() {
    const productos = JSON.parse(localStorage.getItem('sportstock_productos')) || [];

    if (productos.length === 0) {
        alert('No hay productos en el inventario.');
        return;
    }

    const doc = crearDoc('Análisis de Productos Más Vendidos');

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Top productos por valor de inventario', 14, 40);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Ordenado de mayor a menor valor total (precio × stock)', 14, 48);
    doc.setTextColor(30, 41, 59);

    // Ordenar por valor total desc
    const ordenados = [...productos]
        .map(p => ({ ...p, valorTotal: p.precio * p.stock }))
        .sort((a, b) => b.valorTotal - a.valorTotal)
        .slice(0, 10);

    const filas = ordenados.map((p, i) => [
        i + 1,
        p.nombre,
        p.categoria,
        p.stock,
        '$' + Number(p.precio).toLocaleString('es-CO'),
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

    const totalPags = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`SportStock Manager © 2026  |  Página 1 de ${totalPags}`, 105, 290, { align: 'center' });

    guardar(doc, 'productos_mas_vendidos');
}

// ── REPORTE 3: STOCK BAJO ───────────────────────────────
function descargarStockBajo() {
    const productos = JSON.parse(localStorage.getItem('sportstock_productos')) || [];
    const bajos = productos.filter(p => p.stock < 10);

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
        .sort((a, b) => a.stock - b.stock)
        .map(p => [
            p.nombre,
            p.deporte,
            p.categoria,
            p.marca,
            p.stock,
            p.stock <= 3 ? 'CRÍTICO' : 'BAJO'
        ]);

    doc.autoTable({
        startY: 55,
        head: [['Nombre', 'Deporte', 'Categoría', 'Marca', 'Stock', 'Alerta']],
        body: filas,
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [255, 241, 242] },
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
                const color = data.cell.raw === 'CRÍTICO' ? [185, 28, 28] : [217, 119, 6];
                data.cell.styles.textColor = color;
                data.cell.styles.fontStyle = 'bold';
            }
        }
    });

    const totalPags = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`SportStock Manager © 2026  |  Página 1 de ${totalPags}`, 105, 290, { align: 'center' });

    guardar(doc, 'reporte_stock_bajo');
}