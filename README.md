# Iskali Barbería — Sistema de citas (v4)

## ⚠️ Antes de lanzar: lo único pendiente

1. **Precios** — en `config.js`, los 3 servicios normales, las 4 sesiones del Método Iskali y los 3 adicionales tienen `price: null`. Nombres, duraciones y qué incluye cada uno ya están confirmados por Luisillo; solo falta el precio en pesos de cada uno. En cuanto los tengas, se rellenan esos números en `config.js` y no hay que tocar nada más (ni `server.js` ni los archivos de `public/`).
2. **Tipo de letra** — sigue con Fraunces + Inter por ahora. Cuando Luisillo te diga cuál quiere, se cambia en `public/style.css` (busca `font-family`) y en el `<link>` de Google Fonts de cada archivo `.html`.

Las contraseñas del panel ya vienen puestas (`luisillo` / `iskali2026` para admin, `barbero` / `iskalibarb` para el barbero) — ver `.env`.

## Qué cambió en esta versión (v4 — Método Iskali)

- **Nueva sección en la página pública**: al elegir una fecha en jueves, aparece "El Método Iskali" en vez de los servicios normales (los jueves no hay servicios normales, solo Método Iskali — así está en `config.js`, `hours[4] = null`).
- **4 sesiones libres, sin orden obligatorio**: Descubre 🧭, Define 🎯, Proyecta 🔥 y Trasciende 👑. Cualquier cliente puede elegir cualquiera directamente, no hay que "desbloquear" nada. Cada tarjeta muestra su nombre, descripción y qué agrega sobre la base común (que se muestra una sola vez arriba, para no repetirla 4 veces).
- **3 adicionales opcionales** (perfilado de ceja, perfilado de barba, ritual de barba): se pueden sumar a cualquiera de las 4 sesiones, se seleccionan aparte con botones tipo pastilla, y se cobran aparte.
- **Resumen de tu selección** antes de reservar (paso 3), para que el cliente vea exactamente qué eligió antes de confirmar.
- **Panel admin**: al editar una cita de jueves, ahora aparece un selector para cambiar la sesión y checkboxes para los adicionales (antes solo se podía cambiar fecha/hora/nombre/teléfono). Los días normales se editan igual que antes.
- Arreglo importante: `booking.js` todavía apuntaba a un solo "thursdayService" que ya no existe desde que se armó el Método Iskali de 4 sesiones en `config.js`/`server.js` — si alguien hubiera intentado agendar un jueves con la v3 tal cual, la página habría tronado. Ya quedó conectado correctamente.

## Versiones anteriores

- El panel de citas y el de clientes se actualizan solos cada 15-30 segundos — no hace falta recargar la página para ver citas nuevas, y el buscador/filtro no se pierde al actualizarse.
- Se quitó la imagen de portada — solo aparece el logotipo, grande y centrado.

## Cómo probarlo en tu computadora

1. `npm install`
2. Copia `.env.example` a `.env` y pon un usuario/contraseña de prueba (y opcionalmente los del barbero).
3. `npm start`
4. `http://localhost:3000` — página del cliente
5. `http://localhost:3000/admin-login.html` — panel (citas + clientes)

## Actualizar tu proyecto existente en GitHub/Render

Si ya tenías la versión 1 subida, solo reemplaza los archivos de esta carpeta sobre los tuyos (sí se puede sobrescribir todo) y vuelve a subir:

```
git add .
git commit -m "Versión 4: Método Iskali completo (4 sesiones + adicionales)"
git push
```

Render vuelve a desplegar solo en cuanto detecta el push. Si agregaste el rol de barbero, no olvides agregar `BARBER_USER` y `BARBER_PASS` en las variables de entorno de Render (Environment).

## ⚠️ Sobre dónde se guardan los datos

Sigue igual que antes: las citas, los días bloqueados y todo lo demás se guardan en `db.json` dentro del servidor. En el plan gratuito de Render ese archivo se puede reiniciar (perder los datos) cuando el servicio se duerme o subes una actualización. Ya con un cliente real usándolo seguido, vale la pena moverlo a algo persistente — avísame cuando quieras dar ese paso.

## Estructura del proyecto

- `config.js` — información del negocio (servicios, horarios, redes sociales, mensajes).
- `server.js` — toda la lógica: disponibilidad, citas, roles, días bloqueados, clientes y estadísticas.
- `db.js` — cómo se guardan y leen los datos.
- `public/index.html` + `booking.js` — página del cliente.
- `public/admin-login.html`, `admin.html` + `admin.js` — panel de citas (login, lista, calendario, bloqueo de días).
- `public/clientes.html` + `clientes.js` — panel de clientes y estadísticas (solo admin).
- `public/auth.js` — sesión compartida entre las páginas del panel.
- `public/img/` — logo, portada y favicon.
