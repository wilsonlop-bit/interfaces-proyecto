// =============================================
//  SPORTSTOCK - sesion.js
//  Incluir ANTES del JS de cada página
// =============================================

function obtenerSesion() {
    const sesion = JSON.parse(sessionStorage.getItem("ss_sesion") || "null");
    if (!sesion) {
        window.location.href = "login.html";
        return null;
    }
    return sesion;
}

function cerrarSesion() {
    sessionStorage.removeItem("ss_sesion");
    window.location.href = "login.html";
}

function esAdmin() {
    const sesion = JSON.parse(sessionStorage.getItem("ss_sesion") || "null");
    return sesion && sesion.rol === "Administrador";
}

function inicializarHeader() {
    const sesion = obtenerSesion();
    if (!sesion) return;

    const esAdministrador = sesion.rol === "Administrador";

    // Nombre completo
    const elNombre = document.getElementById("header-nombre");
    if (elNombre) elNombre.textContent = sesion.nombreCompleto;

    // Rol
    const elRol = document.getElementById("header-rol");
    if (elRol) elRol.textContent = sesion.rol;

    // Avatar con iniciales
    const elAvatar = document.getElementById("header-avatar");
    if (elAvatar) {
        elAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sesion.nombreCompleto)}&background=f59e0b&color=fff`;
        elAvatar.alt = sesion.nombreCompleto;
    }

    // Saludo (h1) — usa el primer nombre
    const elSaludo = document.getElementById("header-saludo");
    if (elSaludo) {
        const primerNombre = sesion.nombreCompleto.split(" ")[0];
        elSaludo.textContent = `Bienvenido, ${primerNombre}`;
    }

    // Fecha dinámica — soporta tanto id="header-fecha" como id="dash-fecha"
    const fechaTexto = new Date().toLocaleDateString("es-CO", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
    const elFecha = document.getElementById("header-fecha") || document.getElementById("dash-fecha");
    if (elFecha) elFecha.textContent = fechaTexto;

    // Usuarios: solo Administrador
    const navUsuarios = document.getElementById("nav-usuarios");
    if (navUsuarios) navUsuarios.style.display = esAdministrador ? "flex" : "none";

    // Reportes: solo Administrador
    const navReportes = document.getElementById("nav-reportes");
    if (navReportes) navReportes.style.display = esAdministrador ? "flex" : "none";
}