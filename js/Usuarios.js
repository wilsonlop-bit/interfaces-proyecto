// =============================================
//  SPORTSTOCK MANAGER - Usuarios.js
// =============================================

const API_URL = "http://localhost:8080/api/usuarios";
let usuarios = [];
let esAdmin = false;

document.addEventListener('DOMContentLoaded', () => {
    cargarSesion();
    cargarFecha();
    cargarUsuarios();

    document.getElementById("formUsuario").addEventListener("submit", guardar);
    document.getElementById("buscador-usuarios").addEventListener("input", () => {
        renderizarTabla(document.getElementById("buscador-usuarios").value.toLowerCase().trim());
    });
});

// ── SESIÓN Y PERMISOS ────────────────────────────────────
function cargarSesion() {
    const sesion = JSON.parse(sessionStorage.getItem("usuarioActivo") || "null");
    if (!sesion) {
        window.location.href = "login.html";
        return;
    }

    esAdmin = sesion.rol === "Administrador";

    // Header dinámico
    const iniciales = sesion.nombreCompleto.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase();
    document.getElementById("sesion-nombre").textContent  = sesion.nombreCompleto;
    document.getElementById("sesion-rol").textContent     = sesion.rol;
    document.getElementById("sesion-avatar").textContent  = iniciales;
    document.getElementById("saludo-nombre").textContent  = sesion.nombreCompleto.split(" ")[0];

    // Mostrar/ocultar elementos según rol
    if (esAdmin) {
        document.getElementById("btn-crear-usuario").style.display = "flex";
        document.getElementById("th-acciones").style.display       = "table-cell";
    } else {
        document.getElementById("alert-empleado").style.display = "block";
    }
}

// ── FECHA ────────────────────────────────────────────────
function cargarFecha() {
    const fechaEl = document.getElementById("usuarios-fecha");
    if (fechaEl) {
        fechaEl.textContent = new Date().toLocaleDateString("es-CO", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
        });
    }
}

// ── CARGAR USUARIOS ──────────────────────────────────────
async function cargarUsuarios() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error();
        usuarios = await res.json();
        renderizarTabla();
    } catch {
        document.getElementById("tabla-usuarios").innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding:40px; color:#ef4444;">
                    <i class="fas fa-exclamation-circle" style="font-size:24px; display:block; margin-bottom:8px;"></i>
                    No se pudo conectar con el servidor Java
                </td>
            </tr>`;
        document.getElementById("texto-mostrando-usuarios").textContent = "Error al cargar";
    }
}

// ── RENDERIZAR TABLA ─────────────────────────────────────
function renderizarTabla(filtro = "") {
    const tbody   = document.getElementById("tabla-usuarios");
    const textoEl = document.getElementById("texto-mostrando-usuarios");

    const lista = filtro
        ? usuarios.filter(u =>
            u.nombreCompleto.toLowerCase().includes(filtro) ||
            u.nombreUsuario.toLowerCase().includes(filtro))
        : usuarios;

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding:40px; color:#94a3b8;">
                    No hay usuarios que mostrar
                </td>
            </tr>`;
        textoEl.textContent = "Mostrando 0 usuarios";
        return;
    }

    tbody.innerHTML = lista.map(u => {
        const claseRol    = u.rol    === "Administrador" ? "role-admin"    : "role-employee";
        const claseEstado = u.estado === "Activo"        ? "status-active" : "status-inactive";
        const rolIcono    = u.rol    === "Administrador"
            ? '<i class="fas fa-shield-alt" style="margin-right:5px;"></i>'
            : '<i class="far fa-circle"     style="margin-right:5px;"></i>';
        const iniciales   = u.nombreCompleto.split(" ").slice(0, 2).map(p => p[0]).join("").toUpperCase();

        // Columna acciones: solo si es admin
        const colAcciones = esAdmin ? `
            <td>
                <button class="btn-action edit"   onclick="editarUsuario(${u.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-action delete" onclick="eliminarUsuario(${u.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>` : `<td style="display:none;"></td>`;

        return `
        <tr>
            <td>
                <div style="display:flex; align-items:center; gap:12px;">
                    <div style="width:36px; height:36px; border-radius:50%; background:#f59e0b;
                                color:white; display:flex; align-items:center; justify-content:center;
                                font-weight:700; font-size:13px; flex-shrink:0;">
                        ${iniciales}
                    </div>
                    <div>
                        <div style="font-weight:500;">${u.nombreCompleto}</div>
                        <div style="font-size:12px; color:#94a3b8;">${u.nombreUsuario}</div>
                    </div>
                </div>
            </td>
            <td><span class="badge ${claseRol}">${rolIcono}${u.rol}</span></td>
            <td><span class="badge ${claseEstado}">${u.estado}</span></td>
            ${colAcciones}
        </tr>`;
    }).join("");

    textoEl.textContent = `Mostrando ${lista.length} de ${usuarios.length} usuarios`;
}

// ── MODAL ─────────────────────────────────────────────────
function abrirModal() {
    if (!esAdmin) return;
    document.getElementById("formUsuario").reset();
    document.getElementById("usuarioId").value = "";
    document.getElementById("modalTituloUsuario").textContent = "Crear Usuario";
    document.getElementById("modalUsuario").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modalUsuario").style.display = "none";
}

// ── EDITAR ────────────────────────────────────────────────
function editarUsuario(id) {
    if (!esAdmin) return;
    const u = usuarios.find(u => u.id === id);
    if (!u) return;

    document.getElementById("usuarioId").value = u.id;
    document.getElementById("uNombre").value   = u.nombreCompleto;
    document.getElementById("uCorreo").value   = u.nombreUsuario;
    document.getElementById("uRol").value      = u.rol;
    document.getElementById("uEstado").value   = u.estado;
    document.getElementById("modalTituloUsuario").textContent = "Editar Usuario";
    document.getElementById("modalUsuario").style.display = "flex";
}

// ── GUARDAR ───────────────────────────────────────────────
async function guardar(e) {
    e.preventDefault();
    if (!esAdmin) return;

    const id     = document.getElementById("usuarioId").value;
    const nombre = document.getElementById("uNombre").value.trim();
    const correo = document.getElementById("uCorreo").value.trim();
    const rol    = document.getElementById("uRol").value;
    const estado = document.getElementById("uEstado").value;

    if (!nombre || !correo) {
        alert("Por favor completa todos los campos");
        return;
    }

    try {
        const res = await fetch(id ? `${API_URL}/${id}` : API_URL, {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombreCompleto: nombre, nombreUsuario: correo, rol, estado })
        });

        if (!res.ok) throw new Error();
        cerrarModal();
        cargarUsuarios();
        alert(id ? "Usuario actualizado correctamente" : "Usuario creado correctamente");

    } catch {
        alert("Error al guardar el usuario");
    }
}

// ── ELIMINAR ──────────────────────────────────────────────
async function eliminarUsuario(id) {
    if (!esAdmin) return;
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        cargarUsuarios();
        alert("Usuario eliminado correctamente");
    } catch {
        alert("Error al eliminar el usuario");
    }
}