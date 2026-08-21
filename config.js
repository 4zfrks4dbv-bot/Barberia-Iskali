// config.js
// Toda la información del negocio vive aquí. Edita este archivo cuando algo cambie
// (precios, horarios, banco, textos). No hace falta tocar server.js para eso.
//
// NOTA v7: el Método Iskali se puede prender/apagar desde el panel de admin
// (Settings → Método Iskali). El interruptor vive en db.json, no aquí.

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
    whatsapp: "522412213548",
    social: {
      instagram: "https://www.instagram.com/iskali_barberia/",
      facebook: "https://www.facebook.com/profile.php?id=61576221611592",
      tiktok: "https://www.tiktok.com/@barberluisesponda",
    },
  },

  // Horario normal por día de la semana. 0 = domingo … 6 = sábado.
  // El jueves (4) usa este horario cuando el Método Iskali está DESACTIVADO.
  // Cuando está ACTIVADO, usa metodoIskali.open / .close (ver más abajo).
  hours: {
    0: { open: "10:00", close: "18:00" },
    1: { open: "10:00", close: "19:30" },
    2: { open: "10:00", close: "19:30" },
    3: { open: "10:00", close: "19:30" },
    4: { open: "10:00", close: "19:30" }, // jueves normal (Método Iskali inactivo)
    5: { open: "10:00", close: "19:30" },
    6: { open: "10:00", close: "19:30" },
  },

  // Capacidad en días normales. El jueves siempre es 1 (solo Luisillo),
  // tanto con Método Iskali activo como inactivo — ver capacityByDay.
  capacityRegularDays: 1,
  capacityByDay: {
    4: 1, // jueves: solo Luisillo
  },

  // Servicios de todos los días (incluido el jueves cuando Método Iskali
  // está inactivo). Confirmados por Luis el 18/08/26.
  services: [
    {
      id: "corte",
      name: "Corte de cabello",
      icon: "✂️",
      tagline: "Estilo pensado para ti.",
      duration: 45,
      price: 120,
    },
    {
      id: "corte_ceja",
      name: "Corte de cabello + Arreglo de ceja",
      icon: "👁️",
      tagline: "Mayor definición facial.",
      duration: 60,
      price: 150,
    },
    {
      id: "barba",
      name: "Arreglo de barba",
      icon: "🧔",
      tagline: "Perfilado perfecto para ti.",
      duration: 45,
      price: 100,
    },
    {
      id: "corte_barba",
      name: "Corte de cabello + Arreglo de Barba",
      icon: "💈",
      tagline: "Imagen limpia y renovada.",
      duration: 75,
      price: 180,
    },
    {
      id: "corte_barba_ceja",
      name: "Corte de cabello + Arreglo de Barba + Arreglo de ceja",
      icon: "👑",
      tagline: "El cuidado completo de tu imagen.",
      duration: 90,
      price: 230,
    },
  ],

  // Método Iskali — solo se usa si db.settings.metodoIskaliActivo === true.
  // Si está en false, el jueves usa "hours[4]" y "services" de arriba.
  metodoIskali: {
    open: "09:00",
    close: "20:00",
    sessionDuration: 90,
    maxSessionsPerDay: 6,
    capacity: 1,
    lunchBreak: { start: "15:00", end: "16:00" },

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
        price: null,
      },
      {
        id: "define",
        name: "Define",
        emoji: "🎯",
        tagline: "Enfocada en definir y potenciar la imagen.",
        extras: ["Antifaz / antiojeras de colágeno frío"],
        price: null,
      },
      {
        id: "proyecta",
        name: "Proyecta",
        emoji: "🔥",
        tagline: "Pensada para una imagen más cuidada y una experiencia más completa.",
        extras: ["Mascarilla de carbón activado"],
        price: null,
      },
      {
        id: "trasciende",
        name: "Trasciende",
        emoji: "👑",
        tagline: "La experiencia más completa del Método Iskali.",
        extras: ["Exfoliación facial con vaporizador", "Exfoliante facial profesional"],
        price: null,
      },
    ],

    addons: [
      { id: "perfilado_ceja", name: "Perfilado de ceja", price: null },
      { id: "perfilado_barba", name: "Perfilado de barba", price: null },
      { id: "ritual_barba", name: "Ritual de barba", price: null },
    ],
  },

  booking: {
    minAdvanceMinutes: 30,
    maxAdvanceDays: 30,
    cancelationHours: 8,
    // Recargo fijo que se cobra siempre al agendar. Se muestra al confirmar,
    // no en el precio del servicio.
    reservationFee: 20,
  },

  messages: {
    afterBooking:
      "¡Tu cita quedó registrada! Confírmala por WhatsApp con Iskali Barbería para que quede lista.",
    privacyNotice:
      "Los datos proporcionados serán utilizados únicamente para la administración de citas, atención al cliente y " +
      "comunicación relacionada con los servicios de Iskali Barbería. No serán compartidos con terceros sin " +
      "autorización del titular.",
    // Nota que aparece en la página pública el jueves SOLO cuando el Método
    // Iskali está desactivado.
    thursdayNote:
      "Los jueves te atiende personalmente Luisillo, de principio a fin — mismo horario y mismos servicios de siempre.",
  },
};
