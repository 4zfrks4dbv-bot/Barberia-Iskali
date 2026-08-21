const state = {
  config: null,
  selectedService: null, // días normales / jueves sin Método Iskali
  selectedSession: null, // jueves — Método Iskali
  selectedAddons: new Set(), // jueves — adicionales opcionales
  selectedDate: null,
  selectedTime: null,
};

// Convierte "HH:MM" (24h, como se guarda internamente) a "h:MM AM/PM" para mostrar.
function to12Hour(t) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function isThursday(dateStr) {
  return new Date(dateStr + "T00:00:00").getDay() === 4;
}

// true solo si es jueves Y el Método Iskali está activo. Si está apagado,
// el jueves se comporta como cualquier otro día.
function isIskaliDay(dateStr) {
  return isThursday(dateStr) && state.config.metodoIskaliActivo;
}

async function loadConfig() {
  const res = await fetch("/api/config");
  state.config = await res.json();
  renderHeader();
  renderServices();
  if (state.config.metodoIskaliActivo) renderMetodoIskali();
  setupDateInput();
  document.getElementById("privacyNotice").textContent = state.config.messages.privacyNotice;
}

function renderHeader() {
  const b = state.config.business;
  document.getElementById("mapsLink").href = b.mapsUrl;
  document.getElementById("waLink").href = `https://wa.me/${b.whatsapp}`;
  const todayIdx = new Date().getDay();
  const h = state.config.hours[todayIdx];
  if (h) {
    document.getElementById("todayHours").textContent = `Hoy: ${to12Hour(h.open)} – ${to12Hour(h.close)}`;
  } else if (todayIdx === 4 && state.config.metodoIskaliActivo) {
    document.getElementById("todayHours").textContent = `Hoy (jueves): ${to12Hour(state.config.metodoIskali.open)} – ${to12Hour(state.config.metodoIskali.close)}`;
  } else {
    document.getElementById("todayHours").textContent = "Hoy: cerrado";
  }
}

// ---------- Días normales (y jueves cuando Método Iskali está apagado) ----------

function renderServices() {
  const wrap = document.getElementById("services");
  wrap.innerHTML = "";
  const fee = state.config.booking.reservationFee;
  state.config.services.forEach((s) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "service-card";
    el.innerHTML = `
      <div class="service-main">
        <span class="service-name">${s.icon ? s.icon + " " : ""}${s.name}</span>
        ${s.tagline ? `<span class="service-tagline">${s.tagline}</span>` : ""}
      </div>
      <span class="service-meta">${s.price != null ? `$${s.price} · ` : ""}${s.duration} min</span>
    `;
    el.addEventListener("click", () => selectService(s.id, el));
    wrap.appendChild(el);
  });
  const existingFeeNote = document.getElementById("reservationFeeNote");
  if (existingFeeNote) existingFeeNote.remove();
  if (fee) {
    const note = document.createElement("p");
    note.id = "reservationFeeNote";
    note.className = "note";
    note.textContent = `Se agrega un cargo de $${fee} por agendado al confirmar tu cita.`;
    wrap.after(note);
  }
}

function selectService(id, el) {
  state.selectedService = id;
  document.querySelectorAll(".service-card").forEach((c) => c.classList.remove("selected"));
  el.classList.add("selected");
  refreshSlots();
}

// ---------- Jueves — Método Iskali (solo si está activo) ----------

function renderMetodoIskali() {
  const mi = state.config.metodoIskali;

  const baseList = document.getElementById("iskaliBaseList");
  baseList.innerHTML = mi.baseIncludes.map((item) => `<li>${item}</li>`).join("");

  const sessionsWrap = document.getElementById("iskaliSessions");
  sessionsWrap.innerHTML = "";
  mi.sessions.forEach((s, idx) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "session-card";
    el.dataset.id = s.id;

    const dots = mi.sessions.map((_, i) => `<span class="dot${i <= idx ? " on" : ""}"></span>`).join("");
    const extrasHtml = s.extras.length
      ? `<p class="session-extras">+ ${s.extras.join(" · ")}</p>`
      : `<p class="session-extras">La experiencia base del Método Iskali</p>`;

    el.innerHTML = `
      <div class="session-top">
        <span class="session-emoji">${s.emoji}</span>
        <span class="session-level" aria-hidden="true">${dots}</span>
      </div>
      <span class="session-name">Sesión ${s.name}</span>
      <p class="session-tagline">${s.tagline}</p>
      ${extrasHtml}
    `;
    el.addEventListener("click", () => selectSession(s.id, el));
    sessionsWrap.appendChild(el);
  });

  const addonsWrap = document.getElementById("iskaliAddons");
  addonsWrap.innerHTML = "";
  mi.addons.forEach((a) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "addon-pill";
    el.dataset.id = a.id;
    el.textContent = a.name;
    el.addEventListener("click", () => toggleAddon(a.id, el));
    addonsWrap.appendChild(el);
  });
}

function selectSession(id, el) {
  state.selectedSession = id;
  document.querySelectorAll(".session-card").forEach((c) => c.classList.remove("selected"));
  el.classList.add("selected");
  refreshSlots();
}

function toggleAddon(id, el) {
  if (state.selectedAddons.has(id)) {
    state.selectedAddons.delete(id);
    el.classList.remove("selected");
  } else {
    state.selectedAddons.add(id);
    el.classList.add("selected");
  }
}

// ---------- Fecha / horarios (ambos flujos) ----------

function setupDateInput() {
  const input = document.getElementById("dateInput");
  const today = new Date();
  const max = new Date();
  max.setDate(max.getDate() + state.config.booking.maxAdvanceDays);
  input.min = today.toISOString().split("T")[0];
  input.max = max.toISOString().split("T")[0];
  input.addEventListener("change", () => {
    state.selectedDate = input.value;
    const iskaliDay = isIskaliDay(input.value);
    const note = document.getElementById("thursdayNote");

    if (iskaliDay) {
      note.textContent = "Los jueves solo hay 6 sesiones de 90 minutos disponibles, la experiencia completa con Luisillo.";
      note.hidden = false;
    } else if (isThursday(input.value)) {
      note.textContent = state.config.messages.thursdayNote;
      note.hidden = false;
    } else {
      note.hidden = true;
    }

    document.getElementById("servicesSection").hidden = iskaliDay;
    document.getElementById("metodoIskaliSection").hidden = !iskaliDay;
    refreshSlots();
  });
}

async function refreshSlots() {
  const slotsWrap = document.getElementById("slots");
  slotsWrap.innerHTML = "";
  document.getElementById("contactSection").hidden = true;
  if (!state.selectedDate) return;

  const iskaliDay = isIskaliDay(state.selectedDate);

  if (iskaliDay && !state.selectedSession) {
    slotsWrap.innerHTML = '<p class="note">Elige tu sesión primero.</p>';
    return;
  }
  if (!iskaliDay && !state.selectedService) {
    slotsWrap.innerHTML = '<p class="note">Elige un servicio primero.</p>';
    return;
  }

  const serviceParam = iskaliDay ? state.selectedSession : state.selectedService;
  const res = await fetch(`/api/availability?date=${state.selectedDate}&service=${serviceParam}`);
  const data = await res.json();

  if (!data.slots || data.slots.length === 0) {
    slotsWrap.innerHTML = '<p class="note">No hay horarios disponibles ese día. Prueba otra fecha.</p>';
    return;
  }

  data.slots.forEach((s) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot-btn";
    btn.textContent = to12Hour(s.time);
    btn.addEventListener("click", () => selectSlot(s.time, btn));
    slotsWrap.appendChild(btn);
  });
}

function selectSlot(time, el) {
  state.selectedTime = time;
  document.querySelectorAll(".slot-btn").forEach((b) => b.classList.remove("selected"));
  el.classList.add("selected");
  renderSelectionSummary();
  document.getElementById("contactSection").hidden = false;
}

function renderSelectionSummary() {
  const el = document.getElementById("selectionSummary");
  const iskaliDay = isIskaliDay(state.selectedDate);
  const fee = state.config.booking.reservationFee;
  const dateTimeText = `${state.selectedDate} · ${to12Hour(state.selectedTime)}`;

  let basePrice = null;
  let headline = "";

  if (iskaliDay) {
    const mi = state.config.metodoIskali;
    const session = mi.sessions.find((s) => s.id === state.selectedSession);
    const addonNames = [...state.selectedAddons]
      .map((id) => mi.addons.find((a) => a.id === id))
      .filter(Boolean);
    let text = `${session.emoji} Sesión ${session.name}`;
    if (addonNames.length) text += ` + ${addonNames.map((a) => a.name).join(", ")}`;
    headline = text;
    const prices = [session.price, ...addonNames.map((a) => a.price)];
    basePrice = prices.every((p) => p != null) ? prices.reduce((sum, p) => sum + p, 0) : null;
  } else {
    const svc = state.config.services.find((s) => s.id === state.selectedService);
    headline = `${svc.icon ? svc.icon + " " : ""}${svc.name}`;
    basePrice = svc.price;
  }

  let priceLine = "";
  if (basePrice != null && fee) {
    priceLine = ` · $${basePrice} + $${fee} de agendado = $${basePrice + fee}`;
  } else if (basePrice != null) {
    priceLine = ` · $${basePrice}`;
  }

  el.textContent = `${headline}${priceLine} · ${dateTimeText}`;
}

// ---------- Envío ----------

document.getElementById("submitBtn").addEventListener("click", async () => {
  const name = document.getElementById("nameInput").value.trim();
  const phone = document.getElementById("phoneInput").value.trim();
  const errorEl = document.getElementById("errorMsg");
  errorEl.hidden = true;

  if (!name || !phone) {
    errorEl.textContent = "Falta tu nombre o teléfono.";
    errorEl.hidden = false;
    return;
  }

  const iskaliDay = isIskaliDay(state.selectedDate);
  const serviceId = iskaliDay ? state.selectedSession : state.selectedService;
  const addons = iskaliDay ? [...state.selectedAddons] : [];

  const res = await fetch("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, date: state.selectedDate, time: state.selectedTime, serviceId, addons }),
  });
  const data = await res.json();

  if (!res.ok) {
    errorEl.textContent = data.error || "Ese horario ya no está disponible.";
    errorEl.hidden = false;
    refreshSlots();
    return;
  }

  showConfirmation(data);
});

function showConfirmation(data) {
  document.getElementById("contactSection").hidden = true;
  const c = document.getElementById("confirmSection");
  c.hidden = false;
  document.getElementById("afterMsg").textContent = data.afterBookingMessage;
  document.getElementById("confirmWaBtn").href = data.whatsappLink;
  c.scrollIntoView({ behavior: "smooth" });
}

loadConfig();
