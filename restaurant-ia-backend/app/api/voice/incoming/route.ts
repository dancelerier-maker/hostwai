import { NextRequest, NextResponse } from "next/server";
import { getRestaurantProfile } from "@/lib/restaurant";
import { getRestaurantIdByTwilioNumber } from "@/lib/supabaseClient";
import { appendTurn, clearConversation } from "@/lib/conversations";
import { gatherAndSay, sayAndHangup, sayAndTransfer } from "@/lib/twiml";
import { logCall } from "@/lib/store";
import { getAgentOn, getAnswerMode, getRingDelaySeconds } from "@/lib/settings";
import { getBillingStatus } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const callSid = String(form.get("CallSid") || "");
  const from = String(form.get("From") || "unknown");
  const to = String(form.get("To") || "");

  const restaurantId = await getRestaurantIdByTwilioNumber(to);
  if (!restaurantId) {
    const twiml = sayAndHangup("Ce numéro n'est pas encore configuré. Merci de réessayer plus tard.");
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  const restaurantProfile = await getRestaurantProfile(restaurantId);

  const billing = await getBillingStatus(restaurantId);
  if (!billing.hasAccess) {
    await logCall(restaurantId, { callSid, from, startedAt: new Date().toISOString(), turns: 0, transferred: !!restaurantProfile.staffPhoneNumber });
    if (restaurantProfile.staffPhoneNumber) {
      const twiml = sayAndTransfer("Un instant, je vous transfère.", restaurantProfile.staffPhoneNumber);
      return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
    }
    const twiml = sayAndHangup("Désolé, personne n'est disponible pour le moment. Merci de rappeler plus tard.");
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  if (!(await getAgentOn(restaurantId))) {
    await logCall(restaurantId, { callSid, from, startedAt: new Date().toISOString(), turns: 0, transferred: !!restaurantProfile.staffPhoneNumber });
    if (restaurantProfile.staffPhoneNumber) {
      const twiml = sayAndTransfer("Un instant, je vous transfère.", restaurantProfile.staffPhoneNumber);
      return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
    }
    const twiml = sayAndHangup("Désolé, personne n'est disponible pour le moment. Merci de rappeler plus tard.");
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  await clearConversation(callSid);

  const greeting = `Bonjour, ${restaurantProfile.name}, comment puis-je vous aider ?`;
  await appendTurn(restaurantId, callSid, { role: "assistant", content: greeting });

  await logCall(restaurantId, { callSid, from, startedAt: new Date().toISOString(), turns: 1, transferred: false });

  const twiml = gatherAndSay(
    greeting,
    "/api/voice/respond",
    "fr-FR",
    (await getAnswerMode(restaurantId)) === "delayed" ? await getRingDelaySeconds(restaurantId) : 0
  );
  return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
}
