import { NextRequest, NextResponse } from "next/server";
import { getRestaurantProfile } from "@/lib/restaurant";
import { getRestaurantIdByTwilioNumber } from "@/lib/supabaseClient";
import { appendTurn, getConversation } from "@/lib/conversations";
import { getAgentReply } from "@/lib/agent";
import { gatherAndSay, sayAndHangup, sayAndTransfer } from "@/lib/twiml";
import { addReservation, logCall } from "@/lib/store";
import { sendSms } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const callSid = String(form.get("CallSid") || "");
  const from = String(form.get("From") || "unknown");
  const to = String(form.get("To") || "");
  const speechResult = String(form.get("SpeechResult") || "").trim();

  const restaurantId = await getRestaurantIdByTwilioNumber(to);
  if (!restaurantId) {
    const twiml = sayAndHangup("Ce numéro n'est pas encore configuré.");
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  if (!speechResult) {
    const twiml = gatherAndSay("Désolé, je n'ai pas bien entendu. Pouvez-vous répéter ?", "/api/voice/respond");
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  const restaurantProfile = await getRestaurantProfile(restaurantId);

  await appendTurn(restaurantId, callSid, { role: "user", content: speechResult });
  const history = await getConversation(callSid);

  const reply = await getAgentReply(restaurantProfile, history);
  await appendTurn(restaurantId, callSid, { role: "assistant", content: reply.spoken });

  if (reply.reservation) {
    await addReservation(restaurantId, reply.reservation);

    sendSms(
      from,
      `${restaurantProfile.name} : réservation confirmée pour ${reply.reservation.name}, ${reply.reservation.people} pers., ${reply.reservation.time}. À bientôt !`
    );

    if (restaurantProfile.staffPhoneNumber) {
      sendSms(
        restaurantProfile.staffPhoneNumber,
        `Nouvelle réservation (IA) : ${reply.reservation.name}, ${reply.reservation.people} pers., ${reply.reservation.time}.`
      );
    }
  }

  await logCall(restaurantId, {
    callSid,
    from,
    startedAt: new Date().toISOString(),
    turns: history.length + 1,
    transferred: reply.transfer,
  });

  if (reply.transfer) {
    if (!restaurantProfile.staffPhoneNumber) {
      const twiml = sayAndHangup(
        `${reply.spoken} Je ne peux malheureusement pas vous transférer pour le moment, merci de rappeler un peu plus tard.`
      );
      return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
    }
    const twiml = sayAndTransfer(reply.spoken, restaurantProfile.staffPhoneNumber);
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  const twiml = gatherAndSay(reply.spoken, "/api/voice/respond");
  return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
}
