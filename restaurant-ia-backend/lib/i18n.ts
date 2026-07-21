export const locales = ["en", "fr", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

type Dict = {
  nav: { openDashboard: string };
  badge: string;
  hero: { title: string; subtitle: string; cta: string; howItWorks: string; trust: string[] };
  callSnippet: { badge: string; greeting: string; caller1: string; agentReply: string; caller2: string; confirmed: string; question: string; answer: string; smsSent: string };
  comparison: { title: string; withoutLabel: string; withoutList: string[]; withLabel: string; withList: string[] };
  mockup: { label: string };
  features: {
    title: string;
    items: { title: string; text: string }[];
  };
  pricing: {
    title: string;
    subtitle: string;
    starter: { name: string; period: string; detail: string; cta: string };
    pro: { name: string; badge: string; period: string; detail: string; cta: string };
    enterprise: { name: string; price: string; detail: string; cta: string };
    footnote: string;
    launchOffer: string;
  };
  steps: { title: string; items: { title: string; text: string }[] };
  ctaSection: { title: string; text: string; cta: string };
  footer: { tagline: string };
  stats: { title: string; items: { value: string; label: string }[] };
  dashboard: {
    onLabel: string;
    offLabel: string;
    onDesc: string;
    offDesc: string;
    callHistory: string;
    reservations: string;
    noCalls: string;
    noReservations: string;
    settings: string;
    profileTitle: string;
    trialRemaining: (t: string) => string;
    trialOver: string;
    trialOnDesc: string;
    trialOffDesc: string;
    choosePlan: string;
    answerModeLabel: string;
    answerModeImmediate: string;
    answerModeImmediateDesc: string;
    answerModeDelayed: string;
    answerModeDelayedDesc: (seconds: number) => string;
    planLabel: (name: string) => string;
    minutesThisMonth: (used: number, included: number) => string;
    overage: (min: number, cost: number, rate: number) => string;
  };
};

const en: Dict = {
  nav: { openDashboard: "Open dashboard" },
  badge: "Built for independent restaurants",
  hero: {
    title: "Every missed call is a lost table.",
    subtitle:
      "Your team shouldn't have to drop everything to answer the same questions twenty times a service. Hostwai picks up, answers, books the table — and only interrupts your team when it actually matters.",
    cta: "Try free for 1 hour",
    howItWorks: "How it works →",
    trust: ["No card required", "Cancel anytime", "You keep your number"],
  },
  callSnippet: {
    badge: "Call in progress",
    greeting: "Hi, Le Bistrot Central, how can I help?",
    caller1: "A table for 4, tonight at 8:30?",
    agentReply: "Got it! What name should I put it under?",
    caller2: "Martin.",
    confirmed: "added ✓",
    question: "Oh — do you have a terrace, and is it dog-friendly?",
    answer: "Yes to both! I'll note it so we seat you outside.",
    smsSent: "Confirmation SMS sent to the caller",
  },
  comparison: {
    title: "Before / After",
    withoutLabel: "Without Hostwai",
    withoutList: ["Service stops dead every time the phone rings", "The caller hangs up, tries the place next door", "Your team answers the same questions twenty times a night"],
    withLabel: "With Hostwai",
    withList: ["Your team stays focused on the floor", "The reservation is booked without anyone picking up", "Repetitive questions? The AI handles them, instantly"],
  },
  mockup: { label: "The AI answers for you" },
  features: {
    title: "What the agent does",
    items: [
      { title: "Absorbs the repetitive questions", text: "Hours, menu, parking, allergens — answered instantly, so your team isn't interrupted twenty times a service." },
      { title: "Takes reservations", text: "Name, party size, time — logged automatically, no notepad needed." },
      { title: "Speaks several languages", text: "French, English, Spanish — the agent adapts to whoever calls." },
      { title: "Transfers when needed", text: "Tricky question or insistent caller? The call goes straight to your team." },
    ],
  },
  pricing: {
    title: "Pricing",
    subtitle: "The first hour of calls is free, no card required.",
    starter: { name: "Starter", period: "/mo", detail: "100 minutes included, then $0.30/min.", cta: "Start your free hour" },
    pro: { name: "Pro", badge: "Most popular", period: "/mo", detail: "500 minutes included, then $0.25/min.", cta: "Start your free hour" },
    enterprise: { name: "Enterprise", price: "Custom", detail: "Custom volume, multiple locations.", cta: "Contact us" },
    footnote:
      "No unlimited plan: a handful of very high-volume restaurants could otherwise blow up costs. Included minutes are calibrated generously — overage stays rare and is always shown clearly in the dashboard.",
    launchOffer: "Launch offer — 50% off your first 3 months",
  },
  steps: {
    title: "How it works",
    items: [
      { title: "You keep your current number", text: "No carrier change. We just set up conditional call forwarding." },
      { title: "You choose the mode", text: "The agent answers only when nobody picks up, or from the very first ring — your call." },
      { title: "The ON/OFF switch does the rest", text: "One button in your dashboard. On, the agent answers. Off, it rings your team like before." },
    ],
  },
  ctaSection: {
    title: "The next missed call could be the last one.",
    text: "1 hour free trial, no card required. See for yourself if it works.",
    cta: "Try it free now",
  },
  footer: { tagline: "Hostwai — your front desk, day and night." },
  stats: {
    title: "The problem, in numbers",
    items: [
      { value: "34-43%", label: "of restaurant calls go unanswered" },
      { value: "€6,000", label: "lost every month by an average French restaurant" },
      { value: "69%", label: "of callers won't come if nobody picks up" },
    ],
  },
  dashboard: {
    onLabel: "ON",
    offLabel: "OFF",
    onDesc: "Every incoming call is handled by the AI agent. Your team doesn't lift a finger.",
    offDesc: "Calls are forwarded straight to your team. Turn it back on anytime.",
    callHistory: "Call history",
    reservations: "Reservations",
    noCalls: "No calls yet — as soon as a customer calls the connected number, it shows up here.",
    noReservations: "No reservations yet.",
    settings: "Restaurant profile",
    profileTitle: "Restaurant profile",
    trialRemaining: (t) => `Free trial: ${t} left`,
    trialOver: "Free trial ended",
    trialOnDesc: "The AI is answering normally. Pick a plan before it ends to avoid any interruption.",
    trialOffDesc: "Calls go straight to your team until a plan is active.",
    choosePlan: "Choose a plan",
    answerModeLabel: "How the AI answers",
    answerModeImmediate: "Answers right away",
    answerModeImmediateDesc: "The AI picks up from the very first ring.",
    answerModeDelayed: "Answers after ringing",
    answerModeDelayedDesc: (s) => `Rings for ${s}s first, in case your team can grab it.`,
    planLabel: (name) => `${name} plan`,
    minutesThisMonth: (used, included) => `${used} / ${included} min this month`,
    overage: (min, cost, rate) => `${min} min of overage — about $${cost} extra this month ($${rate}/min).`,
  },
};

const fr: Dict = {
  nav: { openDashboard: "Ouvrir le dashboard" },
  badge: "Pensé pour les restaurants indépendants",
  hero: {
    title: "Chaque appel manqué, c'est une table libre.",
    subtitle:
      "Votre équipe n'a plus à lâcher la salle pour répondre aux mêmes questions vingt fois par service. Hostwai décroche, renseigne, prend la réservation — et ne dérange votre équipe que quand ça compte vraiment.",
    cta: "Tester gratuitement — 1h offerte",
    howItWorks: "Comment ça marche →",
    trust: ["Sans carte bancaire", "Résiliable en un clic", "Vous gardez votre numéro"],
  },
  callSnippet: {
    badge: "Appel en cours",
    greeting: "Bonjour, Le Bistrot Central, comment puis-je vous aider ?",
    caller1: "Une table pour 4, ce soir 20h30 ?",
    agentReply: "C'est noté ! À quel nom ?",
    caller2: "Martin.",
    confirmed: "ajouté ✓",
    question: "Ah — vous avez une terrasse, et les chiens sont acceptés ?",
    answer: "Oui aux deux ! Je vous note en terrasse.",
    smsSent: "SMS de confirmation envoyé au client",
  },
  comparison: {
    title: "Avant / Après",
    withoutLabel: "Sans Hostwai",
    withoutList: ["Le service s'arrête net à chaque sonnerie", "Le client raccroche, appelle le resto d'à côté", "Votre équipe répond aux mêmes questions vingt fois par soir"],
    withLabel: "Avec Hostwai",
    withList: ["Votre équipe reste concentrée sur la salle", "La réservation est prise sans que personne décroche", "Les questions répétitives ? L'IA s'en charge, instantanément"],
  },
  mockup: { label: "L'IA répond à votre place" },
  features: {
    title: "Ce que fait l'agent",
    items: [
      { title: "Absorbe les questions répétitives", text: "Horaires, menu, parking, allergènes — répondues instantanément, sans interrompre votre équipe vingt fois par service." },
      { title: "Prend les réservations", text: "Nom, nombre de personnes, heure — enregistrées automatiquement, sans stylo ni carnet." },
      { title: "Parle plusieurs langues", text: "Français, anglais, espagnol — l'agent s'adapte à qui l'appelle." },
      { title: "Transfère si besoin", text: "Question compliquée ou client qui insiste ? L'appel part directement à ton équipe." },
    ],
  },
  pricing: {
    title: "Tarifs",
    subtitle: "La première heure d'appels est offerte, sans carte bancaire.",
    starter: { name: "Starter", period: "/mois", detail: "100 minutes incluses, puis 0,30€/min.", cta: "Commencer l'heure gratuite" },
    pro: { name: "Pro", badge: "Le plus choisi", period: "/mois", detail: "500 minutes incluses, puis 0,25€/min.", cta: "Commencer l'heure gratuite" },
    enterprise: { name: "Enterprise", price: "Sur devis", detail: "Volume personnalisé, plusieurs établissements.", cta: "Nous contacter" },
    footnote:
      "Pas de forfait illimité : un petit nombre de restaurants très fréquentés pourrait sinon faire exploser les coûts. Les minutes incluses sont calibrées large — le dépassement reste rare et clairement affiché dans le dashboard.",
    launchOffer: "Offre de lancement — -50% pendant 3 mois",
  },
  steps: {
    title: "Comment ça marche",
    items: [
      { title: "Tu gardes ton numéro actuel", text: "Aucun changement d'opérateur. On active juste un renvoi d'appel conditionnel." },
      { title: "Tu choisis le mode", text: "Le robot répond seulement si personne ne décroche, ou dès la première sonnerie — toi qui décides." },
      { title: "Le bouton ON/OFF fait le reste", text: "Un bouton, dans ton dashboard. Actif, le robot répond. Coupé, ça sonne chez ton équipe comme avant." },
    ],
  },
  ctaSection: {
    title: "Le prochain appel manqué, ça peut être le dernier.",
    text: "1 heure d'essai, sans carte bancaire. Vous verrez par vous-même si ça marche.",
    cta: "Tester gratuitement maintenant",
  },
  footer: { tagline: "Hostwai — votre standard, jour et nuit." },
  stats: {
    title: "Le problème, en chiffres",
    items: [
      { value: "34-43%", label: "des appels de restaurants restent sans réponse" },
      { value: "6 000€", label: "perdus chaque mois par un restaurant moyen en France" },
      { value: "69%", label: "des appelants ne viennent pas si personne ne décroche" },
    ],
  },
  dashboard: {
    onLabel: "ON",
    offLabel: "OFF",
    onDesc: "Chaque appel entrant est pris par l'agent IA. Ton équipe n'a rien à faire.",
    offDesc: "Les appels sont transférés directement à ton équipe. Réactive quand tu veux.",
    callHistory: "Historique des appels",
    reservations: "Réservations",
    noCalls: "Aucun appel pour l'instant — dès qu'un client appelle le numéro connecté, il apparaît ici.",
    noReservations: "Aucune réservation pour l'instant.",
    settings: "Fiche restaurant",
    profileTitle: "Fiche restaurant",
    trialRemaining: (t) => `Essai gratuit : ${t} restantes`,
    trialOver: "Essai gratuit terminé",
    trialOnDesc: "L'IA répond normalement. Choisis un forfait avant la fin pour ne pas interrompre le service.",
    trialOffDesc: "Les appels partent directement à ton équipe tant qu'aucun forfait n'est actif.",
    choosePlan: "Choisir un forfait",
    answerModeLabel: "Comment l'IA répond",
    answerModeImmediate: "Répond immédiatement",
    answerModeImmediateDesc: "L'IA décroche dès la première sonnerie.",
    answerModeDelayed: "Répond après sonnerie",
    answerModeDelayedDesc: (s) => `Sonne ${s}s d'abord, le temps que ton équipe puisse décrocher.`,
    planLabel: (name) => `Forfait ${name}`,
    minutesThisMonth: (used, included) => `${used} / ${included} min ce mois-ci`,
    overage: (min, cost, rate) => `${min} min de dépassement — environ ${cost}€ en plus ce mois-ci (${rate}€/min).`,
  },
};

const es: Dict = {
  nav: { openDashboard: "Abrir el panel" },
  badge: "Pensado para restaurantes independientes",
  hero: {
    title: "Cada llamada perdida es una mesa que se va.",
    subtitle:
      "Tu equipo no debería dejarlo todo para responder las mismas preguntas veinte veces por servicio. Hostwai contesta, informa, reserva la mesa — y solo avisa a tu equipo cuando de verdad importa.",
    cta: "Probar gratis — 1h de regalo",
    howItWorks: "Cómo funciona →",
    trust: ["Sin tarjeta", "Cancelable en un clic", "Conservas tu número"],
  },
  callSnippet: {
    badge: "Llamada en curso",
    greeting: "Hola, Le Bistrot Central, ¿en qué puedo ayudarte?",
    caller1: "¿Una mesa para 4, esta noche a las 20:30?",
    agentReply: "¡Anotado! ¿A qué nombre?",
    caller2: "Martin.",
    confirmed: "añadida ✓",
    question: "Ah — ¿tenéis terraza, y se admiten perros?",
    answer: "¡Sí a las dos! Te apunto en la terraza.",
    smsSent: "SMS de confirmación enviado al cliente",
  },
  comparison: {
    title: "Antes / Después",
    withoutLabel: "Sin Hostwai",
    withoutList: ["El servicio se para en seco cada vez que suena el teléfono", "El cliente cuelga y llama al de al lado", "Tu equipo responde las mismas preguntas veinte veces por noche"],
    withLabel: "Con Hostwai",
    withList: ["Tu equipo sigue centrado en la sala", "La reserva se hace sin que nadie descuelgue", "¿Preguntas repetitivas? La IA se encarga, al instante"],
  },
  mockup: { label: "La IA contesta por ti" },
  features: {
    title: "Qué hace el agente",
    items: [
      { title: "Absorbe las preguntas repetitivas", text: "Horarios, carta, parking, alérgenos — respondidas al instante, sin interrumpir a tu equipo veinte veces por servicio." },
      { title: "Toma reservas", text: "Nombre, número de personas, hora — registradas automáticamente, sin libreta." },
      { title: "Habla varios idiomas", text: "Francés, inglés, español — el agente se adapta a quien llame." },
      { title: "Transfiere si hace falta", text: "¿Pregunta complicada o cliente insistente? La llamada va directa a tu equipo." },
    ],
  },
  pricing: {
    title: "Precios",
    subtitle: "La primera hora de llamadas es gratis, sin tarjeta.",
    starter: { name: "Starter", period: "/mes", detail: "100 minutos incluidos, luego 0,30€/min.", cta: "Empezar la hora gratis" },
    pro: { name: "Pro", badge: "El más elegido", period: "/mes", detail: "500 minutos incluidos, luego 0,25€/min.", cta: "Empezar la hora gratis" },
    enterprise: { name: "Enterprise", price: "A medida", detail: "Volumen personalizado, varios locales.", cta: "Contactar" },
    footnote:
      "Sin plan ilimitado: un pequeño número de restaurantes con muchísimo volumen podría disparar los costes. Los minutos incluidos son generosos — el exceso es poco frecuente y siempre visible en el panel.",
    launchOffer: "Oferta de lanzamiento — -50% los primeros 3 meses",
  },
  steps: {
    title: "Cómo funciona",
    items: [
      { title: "Conservas tu número actual", text: "Sin cambiar de operador. Solo activamos un desvío de llamadas condicional." },
      { title: "Eliges el modo", text: "El agente contesta solo si nadie descuelga, o desde el primer tono — tú decides." },
      { title: "El botón ON/OFF hace el resto", text: "Un botón en tu panel. Activo, contesta el agente. Apagado, suena en tu equipo como antes." },
    ],
  },
  ctaSection: {
    title: "La próxima llamada perdida puede ser la última.",
    text: "1 hora de prueba gratis, sin tarjeta. Compruébalo tú mismo.",
    cta: "Probar gratis ahora",
  },
  footer: { tagline: "Hostwai — tu recepción, día y noche." },
  stats: {
    title: "El problema, en cifras",
    items: [
      { value: "34-43%", label: "de las llamadas de restaurantes quedan sin respuesta" },
      { value: "3.000€", label: "perdidos cada mes por un restaurante medio en España" },
      { value: "69%", label: "de quienes llaman no vienen si nadie contesta" },
    ],
  },
  dashboard: {
    onLabel: "ON",
    offLabel: "OFF",
    onDesc: "Cada llamada entrante la gestiona el agente de IA. Tu equipo no hace nada.",
    offDesc: "Las llamadas se transfieren directamente a tu equipo. Reactívalo cuando quieras.",
    callHistory: "Historial de llamadas",
    reservations: "Reservas",
    noCalls: "Aún no hay llamadas — en cuanto un cliente llame al número conectado, aparecerá aquí.",
    noReservations: "Aún no hay reservas.",
    settings: "Ficha del restaurante",
    profileTitle: "Ficha del restaurante",
    trialRemaining: (t) => `Prueba gratis: quedan ${t}`,
    trialOver: "Prueba gratis terminada",
    trialOnDesc: "La IA contesta con normalidad. Elige un plan antes de que termine para no interrumpir el servicio.",
    trialOffDesc: "Las llamadas van directas a tu equipo mientras no haya un plan activo.",
    choosePlan: "Elegir un plan",
    answerModeLabel: "Cómo contesta la IA",
    answerModeImmediate: "Contesta enseguida",
    answerModeImmediateDesc: "La IA descuelga desde el primer tono.",
    answerModeDelayed: "Contesta tras el tono",
    answerModeDelayedDesc: (s) => `Suena ${s}s antes, por si tu equipo llega a descolgar.`,
    planLabel: (name) => `Plan ${name}`,
    minutesThisMonth: (used, included) => `${used} / ${included} min este mes`,
    overage: (min, cost, rate) => `${min} min de exceso — unos ${cost}€ de más este mes (${rate}€/min).`,
  },
};

export const dictionaries: Record<Locale, Dict> = { en, fr, es };

export function getDictionary(locale: string): Dict {
  return dictionaries[isLocale(locale) ? locale : defaultLocale];
}
