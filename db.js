// db.js — ahora usa Postgres en vez de un archivo db.json plano.
//
// CÓMO FUNCIONA: en vez de rediseñar todo server.js con tablas separadas
// para citas, días bloqueados, etc. (cambio enorme), guardamos el mismo
// objeto { appointments, blockedDates, settings } que ya usábamos, pero
// dentro de una sola columna JSONB en Postgres. Así server.js casi no
// cambia de lógica — solo readDB()/writeDB() ahora son async porque
// hablan con una base de datos en vez de leer un archivo.
//
// Esto SÍ resuelve el problema real: Postgres en Render tiene disco
// persistente de verdad, sobrevive redeploys, reinicios y que el
// servicio se duerma. db.json ya no se usa para nada, se puede borrar
// del repo.

const { Pool } = require("pg");

const DEFAULT_DB = {
  appointments: [],
  blockedDates: [],
  settings: { metodoIskaliActivo: true },
};

if (!process.env.DATABASE_URL) {
  console.warn(
    "⚠️  Falta DATABASE_URL en las variables de entorno. " +
    "Agrega la Internal Database URL en Render (o la External URL en tu .env local)."
  );
}

// Detecta si es la URL externa (tiene dominio .render.com => necesita SSL)
// o la interna (solo el hostname corto tipo dpg-xxxx-a => sin SSL, misma red).
const isExternalUrl = /\.render\.com/.test(process.env.DATABASE_URL || "");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isExternalUrl ? { rejectUnauthorized: false } : false,
});

let initialized = false;

async function ensureInit() {
  if (initialized) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS store (
      id INTEGER PRIMARY KEY DEFAULT 1,
      data JSONB NOT NULL
    );
  `);
  const { rows } = await pool.query("SELECT data FROM store WHERE id = 1");
  if (rows.length === 0) {
    await pool.query("INSERT INTO store (id, data) VALUES (1, $1)", [DEFAULT_DB]);
  }
  initialized = true;
}

async function readDB() {
  await ensureInit();
  const { rows } = await pool.query("SELECT data FROM store WHERE id = 1");
  const db = rows[0].data;
  if (!db.settings) db.settings = { metodoIskaliActivo: true };
  if (db.settings.metodoIskaliActivo === undefined) db.settings.metodoIskaliActivo = true;
  if (!db.blockedDates) db.blockedDates = [];
  if (!db.appointments) db.appointments = [];
  return db;
}

async function writeDB(data) {
  await ensureInit();
  await pool.query("UPDATE store SET data = $1 WHERE id = 1", [data]);
}

module.exports = { readDB, writeDB };
