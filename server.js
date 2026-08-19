// server.js
// Importante: fijamos la zona horaria del proceso ANTES de usar cualquier Date,
// para que los horarios no se corran (los servidores suelen correr en UTC por
// defecto, y Tlaxcala usa UTC-6 todo el año desde que México eliminó el horario
// de verano en 2022).
process.env.TZ = "America/Mexico_City";

require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const path = require("path");
const config = require("./config");
const { readDB, writeDB } = require("./db");

const app = express();
app.use(express.json());

// ---------- Helpers de horario ----------

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m) {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return String(h).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
}

function getWeekday(dateStr) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(y, mo - 1, d).getDay();
}

function getDayAppointments(db, dateStr) {
  return db.appointments.filter((a) => a.date === dateStr && a.status !== "cancelada");
}

function isDateBlocked(db, dateStr) {
  return (db.blockedDates || []).includes(dateStr);
}

// Revisa, en pasos de 5 minutos, que nunca haya más citas encimadas que "capacity"
function isRangeFree(dayAppts, startMin, durationMin, capacity) {
  for (let t = startMin; t < startMin + durationMin; t += 5) {
    let count = 0;
    for (const a of dayAppts) {
      if (t >= a.startMinutes && t < a.startMinutes + a.duration) count++;
    }
    if (count >= capacity) return false;
  }
  return true;
}

function generateSlots(dateStr, serviceId) {
  const weekday = getWeekday(dateStr);
  const db = readDB();
  if (isDateBlocked(db, dateStr)) return [];

  const dayAppts = getDayAppointments(db, dateStr);
  const now = new Date();
  const minAdvanceMs = config.booking.minAdvanceMinutes * 60000;
  const maxAdvanceMs = config.booking.maxAdvanceDays * 86400000;

  const target = new Date(dateStr + "T00:00:00");
  if (target.getTime() - now.getTime() > maxAdvanceMs) return [];

  if (weekday === 4) {
    const r = config.thursdayRules;
    if (dayAppts.length >= r.maxSessionsPerDay) return [];
    const openMin = timeToMinutes(r.open);
    const closeMin = timeToMinutes(r.close);
    const lunchStart = timeToMinutes(r.lunchBreak.start);
    const lunchEnd = timeToMinutes(r.lunchBreak.end);
    const slots = [];
    // Espacios fijos consecutivos de la duración de la sesión (1h30), no cada 30 min.
    for (let t = openMin; t + r.sessionDuration <= closeMin; t += r.sessionDuration) {
      if (t < lunchEnd && t + r.sessionDuration > lunchStart) continue; // se cruza con la comida
      const candidateDT = new Date(dateStr + "T" + minutesToTime(t) + ":00");
      if (candidateDT.getTime() - now.getTime() < minAdvanceMs) continue;
      if (!isRangeFree(dayAppts, t, r.sessionDuration, r.capacity)) continue;
      slots.push({ time: minutesToTime(t), duration: r.sessionDuration });
    }
    return slots;
  }

  const dayHours = config.hours[weekday];
  if (!dayHours) return [];
  const service = config.services.find((s) => s.id === serviceId);
  if (!service) return [];

  const openMin = timeToMinutes(dayHours.open);
  const closeMin = timeToMinutes(dayHours.close);
  const slots = [];
  for (let t = openMin; t + service.duration <= closeMin; t += 30) {
    const candidateDT = new Date(dateStr + "T" + minutesToTime(t) + ":00");
    if (candidateDT.getTime() - now.getTime() < minAdvanceMs) continue;
    if (!isRangeFree(dayAppts, t, service.duration, config.capacityRegularDays)) continue;
    slots.push({ time: minutesToTime(t), duration: service.duration });
  }
  return slots;
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Suma el recargo fijo de agendado (config.booking.reservationFee) a un precio
// base, siempre y cuando ese precio base ya esté confirmado (no sea null).
function addReservationFee(basePrice) {
  if (basePrice == null) return null;
  return basePrice + config.booking.reservationFee;
}

// ---------- Método Iskali (jueves): arma la sesión + adicionales de una cita ----------
// Se usa tanto al crear la cita como al editarla desde el panel, para que el
// nombre mostrado y la duración salgan siempre igual sin duplicar lógica.

function resolveMetodoIskali(serviceId, addonIds) {
  const session = config.metodoIskali.sessions.find((s) => s.id === serviceId);
  if (!session) return null;

  const ids = Array.isArray(addonIds) ? [...new Set(addonIds)] : [];
  const validAddons = ids
    .map((id) => config.metodoIskali.addons.find((a) => a.id === id))
    .filter(Boolean);

  let serviceName = `${session.emoji} Sesión ${session.name}`.trim();
  if (validAddons.length) {
    serviceName += ` + ${validAddons.map((a) => a.name).join(", ")}`;
  }

  // Si algún precio (sesión o adicional) todavía es null, el total queda en
  // null en vez de un número incompleto/engañoso.
  const prices = [session.price, ...validAddons.map((a) => a.price)];
  const basePrice = prices.every((p) => p != null) ? prices.reduce((sum, p) => sum + p, 0) : null;

  return {
    serviceId: session.id,
    serviceName,
    duration: config.thursdayRules.sessionDuration,
    addons: validAddons.map((a) => a.id),
    basePrice,
    price: addReservationFee(basePrice),
  };
}

// ---------- Autenticación del panel (dos roles: admin y barbero) ----------

const validTokens = new Map(); // token -> "admin" | "barbero"

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const role = token && validTokens.get(token);
  if (!role) return res.status(401).json({ error: "No autorizado" });
  req.role = role;
  next();
}

function requireAdmin(req, res, next) {
  if (req.role !== "admin") return res.status(403).json({ error: "Solo el administrador puede hacer esto" });
  next();
}

app.post("/api/admin/login", (req, res) => {
  const { user, pass } = req.body || {};
  let role = null;
  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) role = "admin";
  else if (process.env.BARBER_USER && user === process.env.BARBER_USER && pass === process.env.BARBER_PASS) role = "barbero";

  if (!role) return res.status(401).json({ ok: false, error: "Usuario o contraseña incorrectos" });

  const token = crypto.randomBytes(24).toString("hex");
  validTokens.set(token, role);
  res.json({ ok: true, token, role });
});

// ---------- API pública ----------

app.get("/api/config", (req, res) => {
  const { business, hours, capacityRegularDays, thursdayRules, services, metodoIskali, booking, messages } = config;
  res.json({
    business,
    hours,
    capacityRegularDays,
    thursdayRules: {
      open: thursdayRules.open,
      close: thursdayRules.close,
      sessionDuration: thursdayRules.sessionDuration,
      maxSessionsPerDay: thursdayRules.maxSessionsPerDay,
    },
    services,
    metodoIskali,
    booking,
    messages: {
      privacyNotice: messages.privacyNotice,
    },
  });
});

app.get("/api/availability", (req, res) => {
  const { date, service } = req.query;
  if (!date) return res.status(400).json({ error: "Falta la fecha" });
  const slots = generateSlots(date, service);
  res.json({ date, slots });
});

app.post("/api/appointments", (req, res) => {
  const { name, phone, date, time, serviceId, addons } = req.body || {};
  if (!name || !phone || !date || !time || !serviceId) {
    return res.status(400).json({ error: "Faltan datos para reservar la cita" });
  }

  const weekday = getWeekday(date);
  let finalServiceId, serviceName, duration, finalAddons, basePrice, price;

  if (weekday === 4) {
    const resolved = resolveMetodoIskali(serviceId, addons);
    if (!resolved) return res.status(400).json({ error: "Sesión no válida" });
    finalServiceId = resolved.serviceId;
    serviceName = resolved.serviceName;
    duration = resolved.duration;
    finalAddons = resolved.addons;
    basePrice = resolved.basePrice;
    price = resolved.price;
  } else {
    const svc = config.services.find((s) => s.id === serviceId);
    if (!svc) return res.status(400).json({ error: "Servicio no válido" });
    finalServiceId = svc.id;
    serviceName = svc.name;
    duration = svc.duration;
    finalAddons = [];
    basePrice = svc.price;
    price = addReservationFee(basePrice);
  }

  const availableTimes = generateSlots(date, finalServiceId).map((s) => s.time);
  if (!availableTimes.includes(time)) {
    return res.status(409).json({ error: "Ese horario ya no está disponible, elige otro" });
  }

  const db = readDB();
  const appt = {
    id: genId(),
    name,
    phone,
    date,
    time,
    startMinutes: timeToMinutes(time),
    duration,
    serviceId: finalServiceId,
    serviceName,
    addons: finalAddons, // [] en días normales; ids de adicionales los jueves
    basePrice, // precio del servicio sin el recargo de agendado
    reservationFee: config.booking.reservationFee,
    price, // total: basePrice + reservationFee (null si algún precio aún no está confirmado)
    status: "pendiente_confirmar",
    createdAt: new Date().toISOString(),
  };
  db.appointments.push(appt);
  writeDB(db);

  // Mensaje de WhatsApp con los datos reales de la cita, para que el barbero
  // confirme viendo quién es, qué pidió y cuándo.
  const priceText = price != null ? ` Total: $${price} (incluye $${config.booking.reservationFee} de recargo por agendar).` : "";
  const waText =
    `Hola, soy ${name}. Quiero confirmar mi cita en Iskali Barbería: ` +
    `${serviceName}, el ${date} a las ${time}.${priceText}`;
  const whatsappLink = `https://wa.me/${config.business.whatsapp}?text=${encodeURIComponent(waText)}`;

  res.json({
    ok: true,
    appointment: appt,
    whatsappLink,
    afterBookingMessage: config.messages.afterBooking,
  });
});

// ---------- API del panel: citas (lectura para ambos roles, escritura solo admin) ----------

app.get("/api/admin/appointments", requireAuth, (req, res) => {
  const db = readDB();
  const sorted = [...db.appointments].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  res.json({ appointments: sorted });
});

app.put("/api/admin/appointments/:id", requireAuth, requireAdmin, (req, res) => {
  const db = readDB();
  const idx = db.appointments.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "No encontrada" });

  if (req.body.time && !/^\d{2}:\d{2}$/.test(req.body.time)) {
    return res.status(400).json({ error: "Formato de hora inválido, usa HH:MM" });
  }

  const current = db.appointments[idx];
  const updated = { ...current, ...req.body };

  if (req.body.date || req.body.time || req.body.serviceId || req.body.addons) {
    const weekday = getWeekday(updated.date);
    let duration, serviceName, serviceId, finalAddons, basePrice, price;

    if (weekday === 4) {
      const wantedServiceId = req.body.serviceId || current.serviceId;
      const wantedAddons = req.body.addons !== undefined ? req.body.addons : current.addons;
      const resolved = resolveMetodoIskali(wantedServiceId, wantedAddons);
      if (!resolved) return res.status(400).json({ error: "Sesión no válida" });
      serviceId = resolved.serviceId;
      serviceName = resolved.serviceName;
      duration = resolved.duration;
      finalAddons = resolved.addons;
      basePrice = resolved.basePrice;
      price = resolved.price;
    } else {
      const svc =
        config.services.find((s) => s.id === updated.serviceId) ||
        config.services.find((s) => s.id === current.serviceId);
      if (!svc) return res.status(400).json({ error: "Servicio no válido" });
      serviceId = svc.id;
      serviceName = svc.name;
      duration = svc.duration;
      finalAddons = [];
      basePrice = svc.price;
      price = addReservationFee(basePrice);
    }

    const dayAppts = getDayAppointments(db, updated.date).filter((a) => a.id !== current.id);
    const capacity = weekday === 4 ? config.thursdayRules.capacity : config.capacityRegularDays;
    if (!isRangeFree(dayAppts, timeToMinutes(updated.time), duration, capacity)) {
      return res.status(409).json({ error: "Ese horario ya está ocupado" });
    }

    updated.serviceId = serviceId;
    updated.serviceName = serviceName;
    updated.duration = duration;
    updated.addons = finalAddons;
    updated.basePrice = basePrice;
    updated.reservationFee = config.booking.reservationFee;
    updated.price = price;
    updated.startMinutes = timeToMinutes(updated.time);
  }

  db.appointments[idx] = updated;
  writeDB(db);
  res.json({ ok: true, appointment: updated });
});

app.delete("/api/admin/appointments/:id", requireAuth, requireAdmin, (req, res) => {
  const db = readDB();
  const before = db.appointments.length;
  db.appointments = db.appointments.filter((a) => a.id !== req.params.id);
  if (db.appointments.length === before) return res.status(404).json({ error: "No encontrada" });
  writeDB(db);
  res.json({ ok: true });
});

// ---------- API del panel: días bloqueados (solo admin) ----------

app.get("/api/admin/blocked-dates", requireAuth, requireAdmin, (req, res) => {
  const db = readDB();
  res.json({ blockedDates: (db.blockedDates || []).sort() });
});

app.post("/api/admin/blocked-dates", requireAuth, requireAdmin, (req, res) => {
  const { date } = req.body || {};
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: "Fecha inválida" });
  const db = readDB();
  if (!db.blockedDates) db.blockedDates = [];
  if (!db.blockedDates.includes(date)) db.blockedDates.push(date);
  writeDB(db);
  res.json({ ok: true, blockedDates: db.blockedDates.sort() });
});

app.delete("/api/admin/blocked-dates/:date", requireAuth, requireAdmin, (req, res) => {
  const db = readDB();
  db.blockedDates = (db.blockedDates || []).filter((d) => d !== req.params.date);
  writeDB(db);
  res.json({ ok: true, blockedDates: db.blockedDates.sort() });
});

// ---------- API del panel: clientes y estadísticas (solo admin) ----------

app.get("/api/admin/clients", requireAuth, requireAdmin, (req, res) => {
  const db = readDB();
  const byPhone = new Map();
  for (const a of db.appointments) {
    if (a.status === "cancelada") continue;
    if (!byPhone.has(a.phone)) byPhone.set(a.phone, { phone: a.phone, name: a.name, visits: 0, lastDate: a.date });
    const c = byPhone.get(a.phone);
    c.visits += 1;
    c.name = a.name; // se queda con el nombre más reciente
    if (a.date > c.lastDate) c.lastDate = a.date;
  }
  const clients = [...byPhone.values()].sort((x, y) => y.visits - x.visits);
  res.json({ clients });
});

app.get("/api/admin/clients/:phone", requireAuth, requireAdmin, (req, res) => {
  const db = readDB();
  const history = db.appointments
    .filter((a) => a.phone === req.params.phone)
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  res.json({ phone: req.params.phone, history });
});

app.get("/api/admin/stats", requireAuth, requireAdmin, (req, res) => {
  const db = readDB();
  const active = db.appointments.filter((a) => a.status !== "cancelada");

  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
  const serviceCounts = {};
  const now = new Date();
  const thisMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  let thisMonthCount = 0;

  for (const a of active) {
    weekdayCounts[getWeekday(a.date)] += 1;
    serviceCounts[a.serviceName] = (serviceCounts[a.serviceName] || 0) + 1;
    if (a.date.startsWith(thisMonthPrefix)) thisMonthCount += 1;
  }

  const weekdayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  let busiestIdx = 0;
  weekdayCounts.forEach((c, i) => { if (c > weekdayCounts[busiestIdx]) busiestIdx = i; });

  let topService = null;
  for (const [name, count] of Object.entries(serviceCounts)) {
    if (!topService || count > topService.count) topService = { name, count };
  }

  res.json({
    totalAppointments: active.length,
    thisMonthCount,
    busiestWeekday: active.length ? weekdayNames[busiestIdx] : null,
    topService,
  });
});

// ---------- Archivos estáticos (la página y el panel) ----------

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Iskali Barbería corriendo en el puerto ${PORT}`));
