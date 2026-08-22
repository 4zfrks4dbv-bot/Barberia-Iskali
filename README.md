# Iskali Barbería — Sistema de citas (v7)

## ⚠️ MUY IMPORTANTE antes de subir esta versión

**No reemplaces el `db.json` que ya está corriendo en Render** con el de esta
carpeta — el de aquí es solo la plantilla para instalaciones nuevas (empieza
vacío). Sube todos los archivos **menos `db.json`**.

**Nunca subas el archivo `.env`.** Contiene las contraseñas del panel de
admin. El repo ya tiene un `.gitignore` que lo excluye — no lo fuerces con
`git add -f` ni lo pegues en ningún commit.

## Qué trae esta versión

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

**Ajustes posteriores a v7 (21/08/26):**
- Precios de los 3 adicionales del Método Iskali ya confirmados y visibles
  en la página: Perfilado de ceja $40, Perfilado de barba $120, Ritual de
  barba $170 (antes salían sin precio en el botón).
- Eslogan debajo del logo actualizado: *"La Barberia es el arte de romper
  las reglas somos Arte" — En IskaliBarberia la calidad, la autenticidad y
  la confianza nos distinguen.*
- El mensaje de WhatsApp de confirmación ahora dice "cuota por agendar" en
  vez de "recargo por agendar".

Por ahora sigue **activado por defecto**, igual que como está funcionando en
producción ahorita.

## Lo único pendiente de antes (sigue igual)

En `config.js`, dentro de `metodoIskali`, las 4 sesiones (Descubre, Define,
Proyecta, Trasciende) todavía tienen `price: null`. En cuanto Luis los
confirme, se rellenan esos números ahí.

Las contraseñas del panel se guardan en `.env` (no en este archivo, no se
suben a GitHub) — pídeselas a Ozkar si las necesitas.

## Cómo probarlo en tu computadora

1. `npm install`
2. Copia `.env.example` a `.env` (o usa el que ya tienes) y llena tus propias
   contraseñas — nunca subas este archivo.
3. `npm start`
4. `http://localhost:3000` — página del cliente
5. `http://localhost:3000/admin-login.html` — panel

## Actualizar tu proyecto existente en GitHub/Render

1. Copia todos los archivos de esta carpeta sobre los tuyos **excepto
   `db.json`** y **`.env`**.
2. Revisa `git status` — confirma que `db.json` y `.env` NO aparecen en la
   lista de cambios antes de seguir.
3. `git add . -- ':!db.json' ':!.env'`
4. `git commit -m "Descripción del cambio"`
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
- `.env` — credenciales del panel (NO se sube a git, está en `.gitignore`).