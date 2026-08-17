// auth.js — helpers de sesión compartidos entre admin-login.html, admin.html y clientes.html
const TOKEN_KEY = "iskali_admin_token";
const ROLE_KEY = "iskali_admin_role";

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function getRole() { return localStorage.getItem(ROLE_KEY); }
function setAuth(token, role) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
}
function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

// fetch con el token ya puesto; si el servidor responde 401, manda a login.
async function authFetch(url, options = {}) {
  const opts = { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${getToken()}` } };
  const res = await fetch(url, opts);
  if (res.status === 401) {
    clearAuth();
    window.location.href = "admin-login.html";
    return null;
  }
  return res;
}

// Protege una página de panel: si no hay sesión, redirige a login.
// Si se pasa adminOnly=true y el rol no es admin, redirige a admin.html.
function guardPage(adminOnly) {
  if (!getToken()) {
    window.location.href = "admin-login.html";
    return false;
  }
  if (adminOnly && getRole() !== "admin") {
    window.location.href = "admin.html";
    return false;
  }
  const badge = document.getElementById("roleBadge");
  if (badge) badge.textContent = getRole() === "admin" ? "Administrador" : "Barbero";
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => { clearAuth(); window.location.href = "admin-login.html"; });
  const clientesTab = document.getElementById("clientesTab");
  if (clientesTab && getRole() !== "admin") clientesTab.style.display = "none";
  return true;
}
