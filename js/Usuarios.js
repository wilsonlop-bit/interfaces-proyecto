// =============================================
//  SPORTSTOCK - usuarios.js
// =============================================

const STORAGE_KEY = 'sportstock_usuarios';

// Usuarios por defecto
const usuariosPorDefecto = [
    { id: '2001', nombre: 'Fredy Diaz',    correo: 'fredy@sportstock.com',   rol: 'Administrador', estado: 'Activo' },
    { id: '2002', nombre: 'Samuel Ruiz',   correo: 'samuel@sportstock.com',  rol: 'Empleado',      estado: 'Activo' },
    { id: '2003', nombre: 'Ana Rodríguez', correo: 'ana@sportstock.com',     rol: 'Empleado',      estado: 'Activo' }
];

// Cargar desde localStorage o usar los de por defecto
let usuarios = JSON.parse(localStorage.getItem(STORAGE_KEY));
if (!usuarios || usuarios.length === 0) {
    usuarios = usuariosPorDefecto;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
}

// Referencias al DOM
const modal         = document.getElementById('modalUsuario');
const formUsuario   = document.getElementById('formUsuario');
const tablaUsuarios = document.getElementById('tabla-usuarios');
const textoMostrando = document.getElementById('texto-mostrando-usuarios');
const buscador      = document.getElementById('buscador-usuarios');

// ── FECHA DINÁMICA ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const fechaEl = document.getElementById('usuarios-fecha');
    if (fechaEl) {
        fechaEl.textContent = new Date().toLocaleDateString('es-CO', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    }
    renderizarTabla();
});

// ── MODAL ───────────────────────────────────────────────
function abrirModal() {
    formUsuario.reset();
    document.getElementById('usuarioId').value = '';
    document.getElementById('modalTituloUsuario').textContent = 'Crear Usuario';
    modal.style.display = 'flex';
}

function cerrarModal() {
    modal.style.display = 'none';
}

function editarUsuario(id) {
    const u = usuarios.find(u => u.id === id);
    if (!u) return;
    document.getElementById('usuarioId').value = u.id;
    document.getElementById('uNombre').value   = u.nombre;
    document.getElementById('uCorreo').value   = u.correo;
    document.getElementById('uRol').value      = u.rol;
    document.getElementById('uEstado').value   = u.estado;
    document.getElementById('modalTituloUsuario').textContent = 'Editar Usuario';
    modal.style.display = 'flex';
}

// ── GUARDAR ─────────────────────────────────────────────
formUsuario.addEventListener('submit', function(e) {
    e.preventDefault();
    const id      = document.getElementById('usuarioId').value;
    const nombre  = document.getElementById('uNombre').value.trim();
    const correo  = document.getElementById('uCorreo').value.trim();
    const rol     = document.getElementById('uRol').value;
    const estado  = document.getElementById('uEstado').value;

    if (id) {
        // Editar existente
        const idx = usuarios.findIndex(u => u.id === id);
        if (idx !== -1) usuarios[idx] = { id, nombre, correo, rol, estado };
    } else {
        // Nuevo usuario
        usuarios.push({ id: Date.now().toString(), nombre, correo, rol, estado });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
    cerrarModal();
    renderizarTabla();
});

// ── ELIMINAR ────────────────────────────────────────────
function eliminarUsuario(id) {
    if (!confirm('¿Eliminar este usuario?')) return;
    usuarios = usuarios.filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
    renderizarTabla();
}

// ── INICIALES AVATAR ────────────────────────────────────
function iniciales(nombre) {
    return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

// ── RENDERIZAR TABLA ────────────────────────────────────
function renderizarTabla(filtro = '') {
    const lista = filtro
        ? usuarios.filter(u =>
            u.nombre.toLowerCase().includes(filtro) ||
            u.correo.toLowerCase().includes(filtro))
        : usuarios;

    tablaUsuarios.innerHTML = lista.map(u => {
        const rolClass    = u.rol === 'Administrador' ? 'role-admin' : 'role-employee';
        const estadoClass = u.estado === 'Activo' ? 'status-active' : 'status-inactive';
        const rolIcono    = u.rol === 'Administrador'
            ? '<i class="fas fa-shield-alt" style="margin-right:5px;"></i>'
            : '<i class="far fa-circle" style="margin-right:5px;"></i>';

        return `
        <tr>
            <td>
                <div style="display:flex; align-items:center; gap:12px;">
                    <div style="width:36px; height:36px; border-radius:50%; background:#f59e0b;
                                color:white; display:flex; align-items:center; justify-content:center;
                                font-weight:700; font-size:13px; flex-shrink:0;">
                        ${iniciales(u.nombre)}
                    </div>
                    <span style="font-weight:500; color:#0f172a;">${u.nombre}</span>
                </div>
            </td>
            <td style="color:#64748b;">
                <i class="fas fa-envelope" style="margin-right:6px; color:#94a3b8;"></i>${u.correo}
            </td>
            <td>
                <span class="badge ${rolClass}">${rolIcono}${u.rol}</span>
            </td>
            <td>
                <span class="badge ${estadoClass}">${u.estado}</span>
            </td>
            <td>
                <button class="btn-action edit" onclick="editarUsuario('${u.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-action delete" onclick="eliminarUsuario('${u.id}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        </tr>`;
    }).join('');

    textoMostrando.textContent = `Mostrando ${lista.length} de ${usuarios.length} usuarios`;
}

// ── BUSCADOR ────────────────────────────────────────────
buscador.addEventListener('input', () => {
    renderizarTabla(buscador.value.toLowerCase().trim());
});