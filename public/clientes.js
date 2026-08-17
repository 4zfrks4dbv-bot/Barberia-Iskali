const state = { clients: [], searchTerm: "" };

if (guardPage(true)) {
  loadStats();
  loadClients();
  document.getElementById("clientSearch").addEventListener("input", (e) => {
    state.searchTerm = e.target.value.trim().toLowerCase();
    renderClients();
  });
  document.getElementById("closeHistoryBtn").addEventListener("click", () => {
    document.getElementById("historySection").hidden = true;
  });

  // Actualiza clientes y estadísticas solas cada 30 segundos, sin recargar.
  setInterval(() => {
    loadStats();
    loadClients();
  }, 30000);
}

async function loadStats() {
  const res = await authFetch("/api/admin/stats");
  if (!res) return;
  const data = await res.json();
  const grid = document.getElementById("statsGrid");
  grid.innerHTML = `
    <div class="stat-box"><div class="num">${data.totalAppointments}</div><div class="label">Citas totales</div></div>
    <div class="stat-box"><div class="num">${data.thisMonthCount}</div><div class="label">Este mes</div></div>
    <div class="stat-box"><div class="num" style="font-size:1.1rem;">${data.busiestWeekday || "—"}</div><div class="label">Día más ocupado</div></div>
    <div class="stat-box"><div class="num" style="font-size:1rem;">${data.topService ? data.topService.name : "—"}</div><div class="label">Servicio más pedido${data.topService ? ` (${data.topService.count})` : ""}</div></div>
  `;
}

async function loadClients() {
  const res = await authFetch("/api/admin/clients");
  if (!res) return;
  const data = await res.json();
  state.clients = data.clients;
  renderClients();
}

function renderClients() {
  const wrap = document.getElementById("clientsList");
  wrap.innerHTML = "";
  const filtered = state.clients.filter((c) => {
    if (!state.searchTerm) return true;
    return c.name.toLowerCase().includes(state.searchTerm) || c.phone.toLowerCase().includes(state.searchTerm);
  });
  if (filtered.length === 0) {
    wrap.innerHTML = '<p class="note">No hay clientes que coincidan.</p>';
    return;
  }
  filtered.forEach((c) => {
    const row = document.createElement("div");
    row.className = "client-row";
    row.innerHTML = `
      <div><strong>${c.name}</strong><br><span class="note">${c.phone} · última visita ${c.lastDate}</span></div>
      <span class="visits">${c.visits} ${c.visits === 1 ? "visita" : "visitas"}</span>
    `;
    row.addEventListener("click", () => showHistory(c.phone, c.name));
    wrap.appendChild(row);
  });
}

async function showHistory(phone, name) {
  const res = await authFetch(`/api/admin/clients/${encodeURIComponent(phone)}`);
  if (!res) return;
  const data = await res.json();
  document.getElementById("historyTitle").textContent = `Historial de ${name}`;
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  data.history.forEach((a) => {
    const row = document.createElement("div");
    row.className = "appt-card";
    row.innerHTML = `<strong>${a.date} · ${a.time}</strong><br><span class="note">${a.serviceName} — ${a.status}</span>`;
    list.appendChild(row);
  });
  document.getElementById("historySection").hidden = false;
  document.getElementById("historySection").scrollIntoView({ behavior: "smooth" });
}
