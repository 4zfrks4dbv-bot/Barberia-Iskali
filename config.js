// config.js
// Toda la información del negocio vive aquí. Edita este archivo cuando algo cambie
// (precios, horarios, banco, textos). No hace falta tocar server.js para eso.
//
// NOTA v5: el Método Iskali ahora se puede prender/apagar desde el panel de
// admin (no hace falta tocar código ni redesplegar). El interruptor vive en
// db.json (db.settings.metodoIskaliActivo), NO aquí. Aquí solo queda la
// configuración de qué son las sesiones, precios, etc. — se usa o no según
// ese interruptor.

module.exports = {
  business: {
    name: "Iskali Barbería",
    shortName: "Luisillo",
    description:
      "Más que un corte de cabello, una experiencia diseñada para resaltar tu estilo. " +
      "En Iskali Barbería cada detalle importa: limpieza, atención personalizada y un " +
      "servicio pensado para que disfrutes cada visita.",
    address:
      "Carretera Tlaxco-Chignahuapan km 1, a 50 mts de la Cruz Roja, frente a bodega de Perfiles y Aceros.",
    mapsUrl: "https://maps.app.goo.gl/ccBuCv2QkniLvo646?g_st=ic",
    whatsapp: "522412213548", // formato: 52 + 10 dígitos, sin espacios ni +
    social: {
      instagram: "https://www.instagram.com/iskali_barberia/",
      facebook: "https://www.facebook.com/profile.php?id=61576221611592",
      tiktok: "https://www.tiktok.com/@barberluisesponda",
    },
  },

  // Horario normal por día de la semana. 0 = domingo ... 6 = sábado.
  // Esto se usa SIEMPRE para días normales, y también para el jueves cuando
  // el Método Iskali está DESACTIVADO (ver capacityByDay más abajo: el
  // jueves solo atiende Luisillo, con o sin Método Iskali).
  hours: {
    0: { open: "10:00", close: "18:00" }, // domingo
    1: { open: "10:00", close: "19:30" }, // lunes
    2: { open: "10:00", close: "19:30" }, // martes
    3: { open: "10:00", close: "19:30" }, // miércoles
    4: { open: "10:00", close: "19:30" }, // jueves — horario normal (se usa si Método Iskali está apagado)
    5: { open: "10:00", close: "19:30" }, // viernes
    6: { open: "10:00", close: "19:30" }, // sábado
  },

  // Cuántas citas pueden traslaparse al mismo tiempo, por día. Si un día no
  // aparece en capacityByDay, se usa capacityRegularDays.
  capacityRegularDays: 2,
  capacityByDay: {
    4: 1, // jueves: solo atiende Luisillo (con Método Iskali activo o no)
  },

  // Servicios de días normales — también son los que se ofrecen el jueves
  // cuando el Método Iskali está desactivado. Precios confirmados por Luis
  // el 16/08/26.
  services: [
    { id: "corte", name: "Corte de cabello", duration: 60, price: 140 },
    { id: "corte_ceja", name: "Corte de cabello y ceja", duration: 60, price: 170 },
    { id: "corte_barba", name: "Corte de cabello y barba", duration: 60, price: 200 },
    { id: "corte_ceja_barba", name: "Corte de cabello, ceja y barba", duration: 75, price: 230 },
  ],

  // Método Iskali (jueves) — solo se usa si db.settings.metodoIskaliActivo
  // es true. Si está en false, el jueves usa "hours" y "services" de arriba,
  // como cualquier otro día.
  metodoIskali: {
    open: "09:00",
    close: "20:00",
    sessionDuration: 90, // minutos, fijo para cualquiera de las 4 sesiones
    maxSessionsPerDay: 6,
    capacity: 1, // solo un barbero (Luisillo)
    lunchBreak: { start: "15:00", end: "16:00" }, // comida, ajustable

    baseIncludes: [
      "Recepción personalizada",
      "Bebida de cortesía",
      "Diagnóstico y asesoría de imagen",
      "Lavado de cabello",
      "Corte de cabello",
      "Peinado y recomendaciones",
      "Aplicación de fragancia premium a elección",
    ],

    sessions: [
      {
        id: "descubre",
        name: "Descubre",
        emoji: "🧭",
        tagline: "La sesión base, enfocada en conocer al cliente y descubrir qué estilo le favorece.",
        extras: [],
        price: null, // PENDIENTE
      },
      {
        id: "define",
        name: "Define",
        emoji: "🎯",
        tagline: "Enfocada en definir y potenciar la imagen.",
        extras: ["Antifaz / antiojeras de colágeno frío"],
        price: null, // PENDIENTE
      },
      {
        id: "proyecta",
        name: "Proyecta",
        emoji: "🔥",
        tagline: "Pensada para una imagen más cuidada y una experiencia más completa.",
        extras: ["Mascarilla de carbón activado"],
        price: null, // PENDIENTE
      },
      {
        id: "trasciende",
        name: "Trasciende",
        emoji: "👑",
        tagline: "La experiencia más completa del Método Iskali.",
        extras: ["Exfoliación facial con vaporizador", "Exfoliante facial profesional"],
        price: null, // PENDIENTE
      },
    ],

    addons: [
      { id: "perfilado_ceja", name: "Perfilado de ceja", price: null }, // PENDIENTE
      { id: "perfilado_barba", name: "Perfilado de barba", price: null }, // PENDIENTE
      { id: "ritual_barba", name: "Ritual de barba", price: null }, // PENDIENTE
    ],
  },

  booking: {
    minAdvanceHours: 2,
    maxAdvanceDays: 30,
    cancelationHours: 8,
  },

  // El mensaje de WhatsApp con los datos de la cita se arma dinámicamente en
  // server.js (nombre, servicio, fecha y hora), aquí solo van los textos fijos.
  messages: {
    afterBooking:
      "¡Tu cita quedó registrada! Confírmala por WhatsApp con Iskali Barbería para que quede lista.",
    privacyNotice:
      "Los datos proporcionados serán utilizados únicamente para la administración de citas, atención al cliente y " +
      "comunicación relacionada con los servicios de Iskali Barbería. No serán compartidos con terceros sin " +
      "autorización del titular.",
    // Se muestra en la página pública el jueves SOLO cuando el Método Iskali
    // está desactivado.
    thursdayNote:
      "Los jueves te atiende personalmente Luisillo, de principio a fin — mismo horario y mismos servicios de siempre.",
  },
};
