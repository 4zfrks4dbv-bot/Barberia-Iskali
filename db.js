// db.js
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "db.json");

const DEFAULT_DB = {
  appointments: [],
  blockedDates: [],
  settings: { metodoIskaliActivo: true },
};

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
  }
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
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
