// Convierte "HH:MM" (24h, como se guarda internamente) a "h:MM AM/PM" para mostrar.
function to12Hour(t) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// ---------- Página de login ----------
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const user = document.getElementById("user").value.trim();
    const pass = document.getElementById("pass").value;
    const errorEl = document.getElementById("loginError");
    errorEl.hidden = true;

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, pass }),
    });
    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || "No se pudo iniciar sesión";
      errorEl.hidden = false;
      return;
    }
    setAuth(data.token, data.role);
    window.location.href = "admin.html";
  });
}

// ---------- Panel de citas ----------
const listEl = document.getElementById("appointmentsList");
if (listEl) {
  const state = { appointments: [], blockedDates: [], view: "list", calendarMonth: new Date(), dayFilter: null, searchTerm: "", businessConfig: null };

  if (guardPage(false)) {
    if (getRole() === "admin") {
      document.getElementById("blockedSection").hidden = false;
      loadBlockedDates();
      loadBusinessConfig();
    }
    document.getElementById("listViewBtn").addEventListener("click", () => setView("list"));
    document.getElementById("calendarViewBtn").addEventListener("click", () => setView("calendar"));
    document.getElementById("searchInput").addEventListener("input", (e) => {
      state.searchTerm = e.target.value.trim().toLowerCase();
      renderList();
    });
    document.getElementById("prevMonthBtn").addEventListener("click", () => shiftMonth(-1));
    document.getElementById("nextMonthBtn").addEventListener("click", () => shiftMonth(1));
    document.getElementById("addBlockBtn").addEventListener("click", addBlockedDate);

    loadAppointments();

    // Actualiza la lista sola cada 15 segundos, sin que tengas que recargar
    // la página — respeta el buscador y el filtro de día que ya tengas puestos.
    // Si hay un formulario de edición abierto, se salta ese ciclo para no
    // interrumpirte a media edición.
    setInterval(() => {
      const openEditForms = document.querySelectorAll(".edit-form:not([hidden])");
      if (openEditForms.length > 0) return;
      loadAppointments();
    }, 15000);
  }

  function setView(view) {
    state.view = view;
    document.getElementById("listViewBtn").classList.toggle("inactive", view !== "list");
    document.getElementById("calendarViewBtn").classList.toggle("inactive", view !== "calendar");
    document.getElementById("calendarWrap").hidden = view !== "calendar";
    if (view === "calendar") renderCalendar();
  }

  function shiftMonth(delta) {
    state.calendarMonth.setMonth(state.calendarMonth.getMonth() + delta);
    renderCalendar();
  }

  async function loadBusinessConfig() {
    const res = await fetch("/api/config");
    state.businessConfig = await res.json();
  }

  async function loadAppointments() {
    const res = await authFetch("/api/admin/appointments");
    if (!res) return;
    const data = await res.json();
    state.appointments = data.appointments;
    renderList();
    if (state.view === "calendar") renderCalendar();
  }

  function matchesSearch(a) {
    if (!state.searchTerm) return true;
    return a.name.toLowerCase().includes(state.searchTerm) || a.phone.toLowerCase().includes(state.searchTerm);
  }

  function renderList() {
    listEl.innerHTML = "";
    let items = state.appointments.filter(matchesSearch);
    if (state.dayFilter) items = items.filter((a) => a.date === state.dayFilter);

    if (state.dayFilter) {
      const banner = document.createElement("p");
      banner.className = "note";
      banner.innerHTML = `Mostrando citas del <strong>${state.dayFilter}</strong> — <a href="#" id="clearDayFilter" style="color:var(--yellow);">ver todas</a>`;
      listEl.appendChild(banner);
      banner.querySelector("#clearDayFilter").addEventListener("click", (e) => {
        e.preventDefault();
        state.dayFilter = null;
        renderList();
      });
    }

    if (items.length === 0) {
      const p = document.createElement("p");
      p.className = "note";
      p.textContent = "No hay citas que coincidan.";
      listEl.appendChild(p);
      return;
    }
    items.forEach((a) => listEl.appendChild(appointmentCard(a)));
  }

  function appointmentCard(a) {
    const isAdmin = getRole() === "admin";
    const card = document.createElement("div");
    card.className = "appt-card";
    const statusLabels = { pendiente_confirmar: "Pendiente de confirmar", confirmada: "Confirmada", cancelada: "Cancelada" };

    let priceText = "";
    if (a.price != null) {
      priceText = ` · $${a.price}`;
      if (a.reservationFee) priceText += ` (incluye $${a.reservationFee} de agendado)`;
    }

    card.innerHTML = `
      <div class="appt-top">
        <div>
          <strong>${a.date} · ${to12Hour(a.time)}</strong><br>
          <span class="note">${a.serviceName} (${a.duration} min)${priceText}</span>
        </div>
        ${isAdmin ? `
          <select data-id="${a.id}" class="statusSelect" style="width:auto;">
            <option value="pendiente_confirmar" ${a.status === "pendiente_confirmar" ? "selected" : ""}>Pendiente de confirmar</option>
            <option value="confirmada" ${a.status === "confirmada" ? "selected" : ""}>Confirmada</option>
            <option value="cancelada" ${a.status === "cancelada" ? "selected" : ""}>Cancelada</option>
          </select>
        ` : `<span class="role-badge">${statusLabels[a.status] || a.status}</span>`}
      </div>
      <p style="margin:10px 0 4px;">${a.name} · ${a.phone}</p>
      ${isAdmin ? `
        <div class="appt-actions">
          <button class="editBtn btn-secondary">Editar</button>
          <button class="deleteBtn btn-danger">Eliminar</button>
        </div>
        <div class="edit-form" hidden></div>
      ` : ""}
    `;

    if (isAdmin) {
      card.querySelector(".statusSelect").addEventListener("change", (e) => updateAppointment(a.id, { status: e.target.value }));
      card.querySelector(".deleteBtn").addEventListener("click", () => {
        if (confirm("¿Eliminar esta cita?")) deleteAppointment(a.id);
      });
      card.querySelector(".editBtn").addEventListener("click", () => toggleEditForm(card, a));
    }

    return card;
  }

  function toggleEditForm(card, a) {
    const form = card.querySelector(".edit-form");
    if (!form.hidden) { form.hidden = true; return; }
    form.hidden = false;

    const isThursday = new Date(a.date + "T00:00:00").getDay() === 4;
    const mi = state.businessConfig && state.businessConfig.metodoIskali;

    let iskaliFieldsHtml = "";
    if (isThursday && mi) {
      const sessionOptions = mi.sessions
        .map((s) => `<option value="${s.id}" ${a.serviceId === s.id ? "selected" : ""}>${s.emoji} Sesión ${s.name}</option>`)
        .join("");
      const addonChecks = mi.addons
        .map(
          (ad) => `
        <label style="display:flex;align-items:center;gap:8px;margin:6px 0 0;font-size:.9rem;color:var(--bone);">
          <input type="checkbox" class="editAddon" value="${ad.id}" ${(a.addons || []).includes(ad.id) ? "checked" : ""} style="width:auto;">
          ${ad.name}
        </label>`
        )
        .join("");
      iskaliFieldsHtml = `
        <label>Sesión (Método Iskali)</label>
        <select class="editSession">${sessionOptions}</select>
        <label>Adicionales</label>
        ${addonChecks}
      `;
    }

    form.innerHTML = `
      <label>Fecha</label>
      <input type="date" class="editDate" value="${a.date}">
      <label>Hora (HH:MM, formato 24h)</label>
      <input type="text" class="editTime" value="${a.time}">
      ${iskaliFieldsHtml}
      <label>Nombre</label>
      <input type="text" class="editName" value="${a.name}">
      <label>Teléfono</label>
      <input type="text" class="editPhone" value="${a.phone}">
      <button class="saveEditBtn">Guardar cambios</button>
      <p class="editError error" hidden></p>
    `;
    form.querySelector(".saveEditBtn").addEventListener("click", async () => {
      const payload = {
        date: form.querySelector(".editDate").value,
        time: form.querySelector(".editTime").value,
        name: form.querySelector(".editName").value,
        phone: form.querySelector(".editPhone").value,
      };
      if (isThursday && mi) {
        payload.serviceId = form.querySelector(".editSession").value;
        payload.addons = [...form.querySelectorAll(".editAddon:checked")].map((el) => el.value);
      }
      const errEl = form.querySelector(".editError");
      errEl.hidden = true;
      const result = await updateAppointment(a.id, payload, true);
      if (result && result.error) {
        errEl.textContent = result.error;
        errEl.hidden = false;
      }
    });
  }

  async function updateAppointment(id, payload, silent) {
    const res = await authFetch(`/api/admin/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res) return null;
    const data = await res.json();
    if (!res.ok) {
      if (!silent) alert(data.error || "No se pudo actualizar");
      return data;
    }
    loadAppointments();
    return data;
  }

  async function deleteAppointment(id) {
    const res = await authFetch(`/api/admin/appointments/${id}`, { method: "DELETE" });
    if (res && res.ok) loadAppointments();
  }

  // ---- Calendario ----
  function renderCalendar() {
    const grid = document.getElementById("calendarGrid");
    const label = document.getElementById("calendarLabel");
    const year = state.calendarMonth.getFullYear();
    const month = state.calendarMonth.getMonth();
    const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    label.textContent = `${monthNames[month]} ${year}`;

    const countsByDate = {};
    state.appointments.forEach((a) => { if (a.status !== "cancelada") countsByDate[a.date] = (countsByDate[a.date] || 0) + 1; });

    grid.innerHTML = "";
    ["D","L","M","M","J","V","S"].forEach((d) => {
      const el = document.createElement("div");
      el.className = "dow";
      el.textContent = d;
      grid.appendChild(el);
    });

    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < startOffset; i++) {
      const el = document.createElement("div");
      el.className = "calendar-day empty";
      grid.appendChild(el);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const el = document.createElement("div");
      const count = countsByDate[dateStr] || 0;
      const blocked = state.blockedDates.includes(dateStr);
      el.className = "calendar-day" + (count > 0 ? " has-appts" : "") + (blocked ? " blocked" : "");
      el.innerHTML = `<span>${d}</span>${count > 0 ? `<span class="count">${count}</span>` : ""}`;
      el.addEventListener("click", () => {
        state.dayFilter = dateStr;
        setView("list");
        renderList();
      });
      grid.appendChild(el);
    }
  }

  // ---- Días bloqueados (solo admin) ----
  async function loadBlockedDates() {
    const res = await authFetch("/api/admin/blocked-dates");
    if (!res) return;
    const data = await res.json();
    state.blockedDates = data.blockedDates;
    renderBlockedList();
  }

  function renderBlockedList() {
    const wrap = document.getElementById("blockedList");
    wrap.innerHTML = "";
    if (state.blockedDates.length === 0) {
      wrap.innerHTML = '<p class="note">No hay días bloqueados.</p>';
      return;
    }
    state.blockedDates.forEach((date) => {
      const pill = document.createElement("div");
      pill.className = "blocked-pill";
      pill.innerHTML = `<span>${date}</span><button>Quitar</button>`;
      pill.querySelector("button").addEventListener("click", async () => {
        const res = await authFetch(`/api/admin/blocked-dates/${date}`, { method: "DELETE" });
        if (!res) return;
        const data = await res.json();
        state.blockedDates = data.blockedDates;
        renderBlockedList();
        if (state.view === "calendar") renderCalendar();
      });
      wrap.appendChild(pill);
    });
  }

  async function addBlockedDate() {
    const input = document.getElementById("blockDateInput");
    if (!input.value) return;
    const res = await authFetch("/api/admin/blocked-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: input.value }),
    });
    if (!res) return;
    const data = await res.json();
    state.blockedDates = data.blockedDates;
    renderBlockedList();
    input.value = "";
    if (state.view === "calendar") renderCalendar();
  }
}
