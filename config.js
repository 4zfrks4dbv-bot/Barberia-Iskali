// config.js
// Toda la información del negocio vive aquí. Edita este archivo cuando algo cambie
// (precios, horarios, banco, textos). No hace falta tocar server.js para eso.
//
// Los campos que dicen null o "PENDIENTE" deben completarse antes de lanzar la página.

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
  // El jueves (4) usa reglas especiales, ver thursdayRules más abajo.
  hours: {
    0: { open: "10:00", close: "18:00" }, // domingo
    1: { open: "10:00", close: "19:30" }, // lunes
    2: { open: "10:00", close: "19:30" }, // martes
    3: { open: "10:00", close: "19:30" }, // miércoles
    4: null, // jueves: ver thursdayRules — todo el día es Método Iskali, sin servicios normales
    5: { open: "10:00", close: "19:30" }, // viernes
    6: { open: "10:00", close: "19:30" }, // sábado
  },

  // Cuántas citas pueden traslaparse al mismo tiempo en días normales.
  // NOTA (18/08/26): Luisillo reportó que el mismo horario se pudo agendar
  // dos veces. Con capacidad 2 eso es esperado (representa 2 barberos), pero
  // si en días normales solo trabaja Luisillo, esto debe quedar en 1. Lo dejo
  // en 1 por ahora — si en realidad hay un segundo barbero atendiendo cortes
  // normales, súbelo de nuevo a 2 en este archivo.
  capacityRegularDays: 1,

  // Jueves — "Método Iskali": solo Luisillo, sesiones largas, cupo limitado
  thursdayRules: {
    open: "09:00",
    close: "20:00",
    sessionDuration: 90, // minutos, fijo para cualquiera de las 4 sesiones
    maxSessionsPerDay: 6,
    capacity: 1, // solo un barbero (Luisillo)
    lunchBreak: { start: "15:00", end: "16:00" }, // comida, ajustable
  },

  // Servicios de días normales (lun-mié, vie-dom).
  // Actualizado el 18/08/26 según mensaje de WhatsApp de Luisillo: reemplaza
  // por completo la lista anterior (nombres, iconos, taglines y precios).
  // "icon" es el emoji que aparece junto al título del servicio en la página.
  // "tagline" es la frase corta que va debajo del nombre.
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

  // Método Iskali — el servicio premium exclusivo de los jueves.
  // 4 sesiones de nivel creciente (misma duración, 90 min), libres: cualquier
  // cliente puede elegir la que quiera, no son progresivas ni tienen requisitos
  // ni orden obligatorio.
  // Además hay 3 adicionales opcionales que se pueden sumar a CUALQUIER sesión,
  // con costo aparte (no vienen incluidos en ninguna sesión).
  //
  // PENDIENTE: precio (price) de cada sesión y de cada adicional. En cuanto
  // Luis los confirme, solo hay que rellenar esos números aquí abajo — no hace
  // falta tocar server.js ni los archivos de public/.
  metodoIskali: {
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
    // Antes eran 2 horas; Luisillo pidió bajarlo a 30 minutos.
    minAdvanceMinutes: 30,
    maxAdvanceDays: 30,
    cancelationHours: 8,
    // Recargo fijo que se cobra SIEMPRE al agendar (días normales y jueves),
    // pero que NO se muestra en el precio del servicio — se suma al confirmar
    // la cita, para que el precio del servicio se vea más bajo.
    reservationFee: 20,
  },

  messages: {
    afterBooking:
      "¡Tu cita quedó registrada! Confírmala por WhatsApp con Iskali Barbería para que quede lista.",
    privacyNotice:
      "Los datos proporcionados serán utilizados únicamente para la administración de citas, atención al cliente y " +
      "comunicación relacionada con los servicios de Iskali Barbería. No serán compartidos con terceros sin " +
      "autorización del titular.",
  },
};
