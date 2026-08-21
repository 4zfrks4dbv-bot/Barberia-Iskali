# Iskali Barbería — Sistema de citas (v5)

## ⚠️ MUY IMPORTANTE antes de subir esta versión

**No reemplaces el `db.json` que ya está corriendo en Render con el de esta
carpeta.** El `db.json` de este zip es solo la plantilla para instalaciones
nuevas (empieza vacío). Si el servidor ya tiene citas de clientes reales
guardadas, sube todos los archivos de esta versión **menos `db.json`** —
así no pierdes ninguna cita. La primera vez que arranque, el código agrega
solo el campo `settings` que falta (ver más abajo), sin tocar las citas que
ya haya.

## Qué cambió en esta versión (v5 — interruptor de Método Iskali)

Ahora puedes prender o apagar el Método Iskali **desde el panel**, sin subir
código nuevo cada vez que Luisillo cambie de opinión:

- **Nueva sección en `admin.html`** (solo visible para el rol admin): "Método
  Iskali (jueves)" con un botón para Activar/Desactivar y el estado actual.
- **Activo** → el jueves se ve y funciona exactamente como antes: los
  clientes eligen entre las 4 sesiones (Descubre, Define, Proyecta,
  Trasciende) más adicionales opcionales, en bloques fijos de 90 minutos.
- **Inactivo** → el jueves se comporta como cualquier otro día: mismo
  horario (10:00–19:30) y los mismos 4 servicios normales. Como Luisillo
  atiende solo ese día, la capacidad ese día es de 1 cita a la vez (no se
  puede traslapar), aunque entre semana sí hay 2 cupos simultáneos.
  Además aparece una nota fija en la página: *"Los jueves te atiende
  personalmente Luisillo, de principio a fin — mismo horario y mismos
  servicios de siempre."*
- El interruptor se guarda en `db.json` (campo `settings.metodoIskaliActivo`),
  así que el cambio es inmediato y no requiere redesplegar.
- El código de las dos versiones del jueves (Método Iskali y horario normal)
  se queda completo en `server.js`, `public/booking.js` y `public/admin.js`
  — nada se borra, así que puedes ir y venir entre los dos modos las veces
  que haga falta.
- El panel de citas, al editar una cita de jueves, ahora decide si mostrar
  los campos de sesión/adicionales según si el Método Iskali está activo
  **en este momento** (no según cómo se agendó la cita originalmente).

Por ahora está activado por defecto (`metodoIskaliActivo: true`), igual que
como estaba funcionando hasta hoy. Lo desactivas tú cuando Luisillo te
confirme que sí quiere el cambio.

## Lo único pendiente de antes (sigue igual)

En `config.js`, dentro de `metodoIskali`, las 4 sesiones y los 3 adicionales
todavía tienen `price: null`. En cuanto Luis los confirme, se rellenan esos
números ahí y no hay que tocar nada más.

Las contraseñas del panel siguen igual (`luisillo` / `iskali2026` para
admin, `barbero` / `iskalibarb` para el barbero) — ver `.env`.

## Cómo probarlo en tu computadora

1. `npm install`
2. Copia `.env.example` a `.env` (o usa el que ya tienes) y pon un
   usuario/contraseña de prueba.
3. `npm start`
4. `http://localhost:3000` — página del cliente
5. `http://localhost:3000/admin-login.html` — panel (citas + clientes)

## Actualizar tu proyecto existente en GitHub/Render

1. Copia todos los archivos de esta carpeta sobre los tuyos **excepto
   `db.json`** (ver la advertencia de arriba).
2. `git add .`
3. `git commit -m "Versión 5: interruptor de Método Iskali desde el panel"`
4. `git push`

Render vuelve a desplegar solo en cuanto detecta el push.

## Sobre dónde se guardan los datos

Sigue igual que antes: las citas, los días bloqueados y ahora también el
interruptor de Método Iskali se guardan en `db.json` dentro del servidor. En
el plan gratuito de Render ese archivo se puede reiniciar (perder los datos)
cuando el servicio se duerme o subes una actualización. Ya con más clientes
reales usándolo seguido, vale la pena moverlo a algo persistente — avísame
cuando quieras dar ese paso.

## Estructura del proyecto

- `config.js` — información del negocio (servicios, horarios, Método Iskali,
  redes sociales, mensajes). El "on/off" del Método Iskali NO vive aquí, vive
  en `db.json`.
- `server.js` — toda la lógica: disponibilidad, citas, roles, días
  bloqueados, clientes, estadísticas y el interruptor de Método Iskali.
- `db.js` — cómo se guardan y leen los datos (incluye `settings`).
- `public/index.html` + `booking.js` — página del cliente.
- `public/admin-login.html`, `admin.html` + `admin.js` — panel de citas
  (login, lista, calendario, bloqueo de días, interruptor de Método Iskali).
- `public/clientes.html` + `clientes.js` — panel de clientes y estadísticas
  (solo admin).
- `public/auth.js` — sesión compartida entre las páginas del panel.
- `public/img/` — logo, portada y favicon.
