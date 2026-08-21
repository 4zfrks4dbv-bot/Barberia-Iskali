// db.js
// Guarda las citas en un archivo JSON simple. No requiere instalar ninguna
// base de datos para empezar a funcionar.
//
// IMPORTANTE: en el plan gratuito de Render este archivo puede reiniciarse
// (perder los datos) cuando el servicio se duerme o cuando subes una
// actualización. Ver README.md para más detalle.

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "db.json");

const DEFAULT_DB = {
  appointments: [],
  blockedDates: [],
  // settings.metodoIskaliActivo controla, sin tocar código, si el jueves usa
  // el Método Iskali (sesiones especiales) o el horario/servicios normales.
  // Se cambia desde el panel de admin. true = como estaba hasta ahora.
  settings: { metodoIskaliActivo: true },
};

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
  }
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  // Rellena valores por defecto si vienen de una versión anterior de db.json
  // que no tenía "settings" (evita que la app truene con datos viejos).
  if (!db.settings) db.settings = { metodoIskaliActivo: true };
  if (db.settings.metodoIskaliActivo === undefined) db.settings.metodoIskaliActivo = true;
  if (!db.blockedDates) db.blockedDates = [];
  if (!db.appointments) db.appointments = [];
  return db;
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
