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

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ appointments: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
