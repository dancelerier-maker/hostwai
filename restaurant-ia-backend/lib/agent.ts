// force redeploy
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { RestaurantProfile } from "./restaurant";
import { listReservations } from "./store";
import type { Turn } from "./conversations";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function buildSystemPrompt(profile: RestaurantProfile, reservations: Awaited<ReturnType<typeof listReservations>>): string {
  const list = reservations.length
    ? reservations.map((r) => `- ${r.name}, ${r.people} pers., ${r.time}`).join("\n")
    : "Aucune réservation pour l'instant.";

  return `Tu es la réceptionniste IA téléphonique du restaurant "${profile.name}".
Horaires : ${profile.hours}
Langues parlées : ${profile.languages}
Infos utiles : ${profile.highlights}

Réservations déjà enregistrées ce soir :
${list}

Règles :
- Réponds comme au téléphone : phrases courtes, naturelles, chaleureuses, jamais robotiques. Pas de listes à puces, pas de formatage — c'est de la voix.
- Détecte la langue de l'appelant dès sa première phrase et réponds dans cette langue pour le reste de l'appel.
- Ton but principal : prendre des réservations (nom, nombre de personnes, heure), répondre aux questions sur les horaires/menu/accès, et transférer les cas trop complexes.
- Quand une réservation est confirmée avec toutes les infos (nom, heure, nombre de personnes), termine ta réponse par une ligne exacte :
RESERVATION_JSON:{"name":"...", "people": N, "time":"..."}
  Rien d'autre sur cette ligne. Ne l'inclus que quand la réservation est vraiment confirmée par l'appelant.
- Si l'appelant demande à parler à un humain, ou pose une question à laquelle tu ne peux pas répondre, dis que tu transfères l'appel et termine par la ligne exacte :
TRANSFER_CALL:true
- Ne mentionne jamais que tu es une IA sauf si on te le demande directement.
- Reste bref : 1 à 3 phrases par réponse, comme une vraie hôtesse au téléphone.`;
}

export type AgentReply = {
  spoken: string;
  reservation: { name: string; people: number; time: string } | null;
  transfer: boolean;
};

export async function getAgentReply(profile: RestaurantProfile, history: Turn[]): Promise<AgentReply> {
  const reservations = await listReservations();

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: buildSystemPrompt(profile, reservations),
  });

  const contents = history.map((t) => ({
    role: t.role === "assistant" ? "model" : "user",
    parts: [{ text: t.content }],
  }));

  const result = await model.generateContent({ contents });
  const raw = result.response.text();

  let spoken = raw;
  let reservation: AgentReply["reservation"] = null;
  let transfer = false;

  const resMatch = raw.match(/RESERVATION_JSON:(\{.*\})/);
  if (resMatch) {
    spoken = spoken.replace(resMatch[0], "").trim();
    try {
      reservation = JSON.parse(resMatch[1]);
    } catch {
      // JSON malformé venant du modèle — on ignore, pas la peine de planter l'appel
    }
  }

  const transferMatch = raw.match(/TRANSFER_CALL:true/);
  if (transferMatch) {
    spoken = spoken.replace(transferMatch[0], "").trim();
    transfer = true;
  }

  return { spoken, reservation, transfer };
}
