# Iskali Barbería — Sistema de citas (v7)

## ⚠️ MUY IMPORTANTE antes de subir esta versión

**No reemplaces el `db.json` que ya está corriendo en Render** con el de esta
carpeta — el de aquí es solo la plantilla para instalaciones nuevas (empieza
vacío). Sube todos los archivos **menos `db.json`**.

## Qué trae esta versión

Esta v7 junta dos cosas que se habían separado por accidente en un commit
anterior — ya quedaron unidas y probadas juntas:

**De la versión con los precios/iconos actuales (18/08/26):**
- Servicios con ícono y frase corta (ej. "✂️ Corte de cabello — Estilo
  pensado para ti").
- Horarios en formato 12 horas (AM/PM) en toda la página.
- Cargo fijo de $20 por agendado, que se suma al precio del servicio y se
  muestra solo al confirmar (no en la tarjeta del servicio).
- Mínimo de anticipación para agendar bajado a 30 minutos.
- Capacidad de días normales corregida a 1 (evita el bug de doble-agendado
  que Luisillo reportó).

**Del interruptor de Método Iskali (panel de admin):**
- Sección "Método Iskali (jueves)" en `admin.html`, solo para el rol admin,
  con botón Activar/Desactivar.
- **Activo** → el jueves funciona como las 4 sesiones especiales (Descubre,
  Define, Proyecta, Trasciende) de 90 min, igual que siempre.
- **Inactivo** → el jueves se comporta como cualquier otro día: mismo
  horario, mismos 5 servicios normales (con sus iconos y el cargo de $20),
  capacidad de 1 cita a la vez porque solo atiende Luisillo, y aparece la
  nota fija: *"Los jueves te atiende personalmente Luisillo, de principio a
  fin — mismo horario y mismos servicios de siempre."*
- El interruptor se guarda en `db.json` (`settings.metodoIskaliActivo`), así
  que el cambio es inmediato, sin subir código.
- Al editar una cita de jueves desde el panel, los campos de sesión/adicionales
  del Método Iskali solo aparecen si está activo en ese momento.

Por ahora sigue **activado por defecto**, igual que como está funcionando en
producción ahorita.

## Lo único pendiente de antes (sigue igual)

En `config.js`, dentro de `metodoIskali`, las 4 sesiones y los 3 adicionales
todavía tienen `price: null`. En cuanto Luis los confirme, se rellenan esos
números ahí.

Las contraseñas del panel siguen igual (`luisillo` / `iskali2026` para
admin, `barbero` / `iskalibarb` para el barbero) — ver `.env`.

## Cómo probarlo en tu computadora

1. `npm install`
2. Copia `.env.example` a `.env` (o usa el que ya tienes).
3. `npm start`
4. `http://localhost:3000` — página del cliente
5. `http://localhost:3000/admin-login.html` — panel

## Actualizar tu proyecto existente en GitHub/Render

1. Copia todos los archivos de esta carpeta sobre los tuyos **excepto
   `db.json`**.
2. Revisa `git status` — confirma que `db.json` NO aparece en la lista de
   cambios antes de seguir.
3. `git add . -- ':!db.json'`
4. `git commit -m "Versión 7: junta precios/iconos/cargo con el interruptor de Método Iskali"`
5. `git push`

## Sobre dónde se guardan los datos

Las citas, los días bloqueados y el interruptor de Método Iskali se guardan
en `db.json` dentro del servidor. En el plan gratuito de Render ese archivo
se puede reiniciar (perder los datos) cuando el servicio se duerme o subes
una actualización — sigue siendo el pendiente más importante a resolver
antes de escalar a más clientes.

## Estructura del proyecto

- `config.js` — servicios (con iconos/taglines/precios), Método Iskali,
  cargo de agendado, horarios, redes sociales, mensajes.
- `server.js` — disponibilidad, citas, roles, días bloqueados, clientes,
  estadísticas y el interruptor de Método Iskali.
- `db.js` — lectura/escritura de `db.json` (incluye `settings`).
- `public/index.html` + `booking.js` — página del cliente.
- `public/admin-login.html`, `admin.html` + `admin.js` — panel (login,
  lista, calendario, días bloqueados, interruptor de Método Iskali).
- `public/clientes.html` + `clientes.js` — panel de clientes/estadísticas.
- `public/auth.js` — sesión compartida entre páginas del panel.
- `public/img/` — logo, portada y favicon.
