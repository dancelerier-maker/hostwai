import { NextRequest, NextResponse } from "next/server";
import { restaurantProfile } from "@/lib/restaurant";
import { appendTurn, clearConversation } from "@/lib/conversations";
import { gatherAndSay, sayAndHangup, sayAndTransfer } from "@/lib/twiml";
import { logCall } from "@/lib/store";
import { getAgentOn, getAnswerMode, getRingDelaySeconds } from "@/lib/settings";
import { getBillingStatus } from "@/lib/billing";

// Configure this URL as your Twilio phone number's "A call comes in" webhook:
// https://your-domain.com/api/voice/incoming  (method: POST)
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const callSid = String(form.get("CallSid") || "");
  const from = String(form.get("From") || "unknown");

  // Essai gratuit épuisé et pas d'abonnement actif -> on ne laisse pas l'IA répondre.
  if (!getBillingStatus().hasAccess) {
    logCall({ callSid, from, startedAt: new Date().toISOString(), turns: 0, transferred: !!restaurantProfile.staffPhoneNumber });
    if (restaurantProfile.staffPhoneNumber) {
      const twiml = sayAndTransfer("Un instant, je vous transfère.", restaurantProfile.staffPhoneNumber);
      return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
    }
    const twiml = sayAndHangup("Désolé, personne n'est disponible pour le moment. Merci de rappeler plus tard.");
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  // The ON/OFF switch in the dashboard is checked right here, on every call.
  if (!getAgentOn()) {
    logCall({ callSid, from, startedAt: new Date().toISOString(), turns: 0, transferred: !!restaurantProfile.staffPhoneNumber });
    if (restaurantProfile.staffPhoneNumber) {
      const twiml = sayAndTransfer("Un instant, je vous transfère.", restaurantProfile.staffPhoneNumber);
      return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
    }
    const twiml = sayAndHangup("Désolé, personne n'est disponible pour le moment. Merci de rappeler plus tard.");
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  clearConversation(callSid);

  const greeting = `Bonjour, ${restaurantProfile.name}, comment puis-je vous aider ?`;
  appendTurn(callSid, { role: "assistant", content: greeting });

  logCall({ callSid, from, startedAt: new Date().toISOString(), turns: 1, transferred: false });

  const twiml = gatherAndSay(
    greeting,
    "/api/voice/respond",
    "fr-FR",
    getAnswerMode() === "delayed" ? getRingDelaySeconds() : 0
  );
  return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
}
