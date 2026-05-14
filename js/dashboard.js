document.addEventListener('DOMContentLoaded', () => {

    const fechaEl = document.getElementById('dash-fecha');
    if (fechaEl) {
        const hoy = new Date();
        fechaEl.textContent = hoy.toLocaleDateString('es-CO', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    let productos = JSON.parse(localStorage.getItem('sportstock_productos')) || [];

    const stockMin = 10;
    const bajosStock = productos.filter(p => p.stock < stockMin);
    const valorInventario = productos.reduce((suma, p) => suma + (p.precio * p.stock), 0);

    // Tarjetas
    const elTotal = document.getElementById('dash-total-productos');
    const elBajos = document.getElementById('dash-bajos-stock');
    const elValor = document.getElementById('dash-valor-total');

    if (elTotal) elTotal.textContent = productos.length;
    if (elBajos) elBajos.textContent = bajosStock.length;
    if (elValor) elValor.textContent = '$ ' + valorInventario.toLocaleString('es-CO');

    // Actividad reciente
    const contenedorActividad = document.getElementById('dash-actividad-reciente');
    if (contenedorActividad) {
        contenedorActividad.innerHTML = [...productos].reverse().slice(0, 5).map(p => `
            <div style="display:flex; justify-content:space-between; align-items:center; 
                        padding:12px 0; border-bottom:1px solid #f1f5f9;">
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="background:#eef2ff; color:#4f46e5; width:40px; height:40px; 
                                display:flex; justify-content:center; align-items:center; border-radius:8px;">
                        <i class="fas fa-box"></i>
                    </div>
                    <div>
                        <h4 style="margin:0; font-size:14px; color:#1e293b;">${p.nombre}</h4>
                        <p style="margin:0; font-size:12px; color:#64748b;">${p.categoria}</p>
                    </div>
                </div>
                <span style="color:${p.stock < 10 ? '#ef4444' : '#10b981'}; font-size:13px; font-weight:bold;">Stock: ${p.stock}</span>
            </div>
        `).join('');
    }

    // Alertas stock bajo
    const contenedorAlertas = document.getElementById('dash-alertas-stock');
    if (contenedorAlertas) {
        contenedorAlertas.innerHTML = bajosStock.length === 0
            ? '<p style="color:#10b981; padding:10px;">✅ Stock al día</p>'
            : bajosStock.map(p => `
                <div style="display:flex; justify-content:space-between; align-items:center; 
                            background:#fff1f2; padding:10px; border-radius:8px; margin-bottom:8px;">
                    <h4 style="margin:0; font-size:13px; color:#1e293b;">${p.nombre}</h4>
                    <span style="background:#ef4444; color:white; padding:2px 8px; 
                                 border-radius:10px; font-size:11px; font-weight:bold;">
                        ${p.stock} un.
                    </span>
                </div>
            `).join('');
    }
});