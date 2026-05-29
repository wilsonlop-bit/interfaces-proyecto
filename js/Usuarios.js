// =============================================
//  SPORTSTOCK - Usuarios.js
// =============================================

const API_URL_USUARIOS = "http://localhost:8080/api/usuarios";
let usuarios = [];

const modal = document.getElementById('modalUsuario');
const formUsuario = document.getElementById('formUsuario');
const tablaUsuarios = document.getElementById('tabla-usuarios');
const textoMostrando = document.getElementById('texto-mostrando-usuarios');

document.addEventListener('DOMContentLoaded', () => {
    inicializarHeader();

    // Solo admins pueden estar aquí
    if (!esAdmin()) {
        window.location.href = "index.html";
        return;
    }

    cargarUsuarios();

    // Buscador en tiempo real
    const buscador = document.getElementById('buscador-usuarios');
    if (buscador) {
        buscador.addEventListener('input', () => {
            const filtro = buscador.value.toLowerCase();
            const filtrados = usuarios.filter(u =>
                (u.nombreCompleto || '').toLowerCase().includes(filtro) ||
                (u.nombreUsuario || '').toLowerCase().includes(filtro)
            );
            renderizarTabla(filtrados);
        });
    }
});

// ── CARGAR USUARIOS ────────────────────────────────────
async function cargarUsuarios() {
    try {
        const response = await fetch(API_URL_USUARIOS);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        usuarios = await response.json();
        renderizarTabla(usuarios);
    } catch (error) {
        console.error("Error al cargar usuarios:", error);
        tablaUsuarios.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:40px; color:#ef4444;">
                    <i class="fas fa-exclamation-circle" style="font-size:30px; margin-bottom:10px; display:block;"></i>
                    <strong>No se pudo conectar con el servidor. Verifica que Java esté corriendo en localhost:8080</strong>
                </td>
            </tr>`;
        textoMostrando.textContent = "Error al cargar usuarios";
    }
}

// ── MODAL ───────────────────────────────────────────────
function abrirModal() {
    formUsuario.reset();
    document.getElementById('usuarioId').value = '';
    document.getElementById('modalTituloUsuario').textContent = 'Crear Usuario';
    // Mostrar campo contraseña al crear
    document.getElementById('campo-password').style.display = 'block';
    modal.style.display = 'flex';
}

function cerrarModal() {
    modal.style.display = 'none';
}

// ── EDITAR ──────────────────────────────────────────────
function editarUsuario(id) {
    const u = usuarios.find(u => u.id === id);
    if (!u) return;

    document.getElementById('usuarioId').value = u.id;
    document.getElementById('uNombre').value = u.nombreCompleto || '';
    document.getElementById('uUsuario').value = u.nombreUsuario || '';
    document.getElementById('uPassword').value = '';
    document.getElementById('uRol').value = u.rol || 'Empleado';
    document.getElementById('uEstado').value = u.estado || 'Activo';
    document.getElementById('modalTituloUsuario').textContent = 'Editar Usuario';
    // Contraseña opcional al editar
    document.getElementById('campo-password').style.display = 'block';
    modal.style.display = 'flex';
}

// ── GUARDAR ─────────────────────────────────────────────
formUsuario.addEventListener('submit', async function (e) {
    e.preventDefault();

    const id = document.getElementById('usuarioId').value;
    const password = document.getElementById('uPassword').value.trim();

    // Al crear, contraseña es obligatoria
    if (!id && !password) {
        alert("La contraseña es obligatoria al crear un usuario.");
        return;
    }

    const datos = {
        nombreCompleto: document.getElementById('uNombre').value.trim(),
        nombreUsuario: document.getElementById('uUsuario').value.trim(),
        password: password || undefined,
        rol: document.getElementById('uRol').value,
        estado: document.getElementById('uEstado').value
    };

    try {
        const url = id ? `${API_URL_USUARIOS}/${id}` : API_URL_USUARIOS;
        const method = id ? "PUT" : "POST";
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || "Error al guardar");
        }

        cerrarModal();
        cargarUsuarios();
        alert(id ? "Usuario actualizado correctamente" : "Usuario creado correctamente");
    } catch (error) {
        alert("Error: " + error.message);
    }
});

// ── ELIMINAR ────────────────────────────────────────────
async function eliminarUsuario(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    try {
        const response = await fetch(`${API_URL_USUARIOS}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Error al eliminar");
        cargarUsuarios();
        alert("Usuario eliminado correctamente");
    } catch (error) {
        alert("Error al eliminar el usuario: " + error.message);
    }
}

// ── RENDERIZAR TABLA ───────────────────────────────────
function renderizarTabla(lista) {
    if (!lista || lista.length === 0) {
        tablaUsuarios.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:40px; color:#94a3b8;">
                    <i class="fas fa-users" style="font-size:30px; margin-bottom:10px; display:block;"></i>
                    No hay usuarios que mostrar
                </td>
            </tr>`;
        textoMostrando.textContent = "Mostrando 0 usuarios";
        return;
    }

    tablaUsuarios.innerHTML = lista.map(u => {
        const rolClass = u.rol === 'Administrador' ? 'role-admin' : 'role-employee';
        const estadoClass = u.estado === 'Activo' ? 'status-active' : 'status-inactive';

        return `
        <tr>
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombreCompleto || u.nombreUsuario)}&background=f59e0b&color=fff&size=32"
                         style="width:32px; height:32px; border-radius:50%;" alt="Avatar">
                    <div>
                        <div style="font-weight:600; color:#0f172a; font-size:14px;">${u.nombreCompleto || '—'}</div>
                        <div style="font-size:12px; color:#64748b;">@${u.nombreUsuario || '—'}</div>
                    </div>
                </div>
            </td>
            <td style="color:#64748b; font-size:13px;">—</td>
            <td><span class="badge ${rolClass}">${u.rol || '—'}</span></td>
            <td><span class="badge ${estadoClass}">${u.estado || '—'}</span></td>
            <td>
                <button class="btn-action edit" onclick="editarUsuario(${u.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-action delete" onclick="eliminarUsuario(${u.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        </tr>`;
    }).join('');

    textoMostrando.textContent = `Mostrando ${lista.length} usuario(s)`;
}