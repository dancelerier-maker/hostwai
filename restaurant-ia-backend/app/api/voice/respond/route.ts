import { NextRequest, NextResponse } from "next/server";
import { getRestaurantProfile } from "@/lib/restaurant";
import { appendTurn, getConversation } from "@/lib/conversations";
import { getAgentReply } from "@/lib/agent";
import { gatherAndSay, sayAndHangup, sayAndTransfer } from "@/lib/twiml";
import { addReservation, logCall } from "@/lib/store";
import { sendSms } from "@/lib/sms";

// This is the "action" URL Twilio posts to after each <Gather> captures speech.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const callSid = String(form.get("CallSid") || "");
  const from = String(form.get("From") || "unknown");
  const speechResult = String(form.get("SpeechResult") || "").trim();

  if (!speechResult) {
    // Caller said nothing intelligible — ask once more instead of hanging up immediately.
    const twiml = gatherAndSay("Désolé, je n'ai pas bien entendu. Pouvez-vous répéter ?", "/api/voice/respond");
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  const restaurantProfile = await getRestaurantProfile();

  await appendTurn(callSid, { role: "user", content: speechResult });
  const history = await getConversation(callSid);

  const reply = await getAgentReply(restaurantProfile, history);
  await appendTurn(callSid, { role: "assistant", content: reply.spoken });

  if (reply.reservation) {
    await addReservation(reply.reservation);

    // Confirmation au client — sur le numéro qui a appelé, capturé automatiquement par Twilio.
    sendSms(
      from,
      `${restaurantProfile.name} : réservation confirmée pour ${reply.reservation.name}, ${reply.reservation.people} pers., ${reply.reservation.time}. À bientôt !`
    );

    // Notification au staff, si un numéro est configuré.
    if (restaurantProfile.staffPhoneNumber) {
      sendSms(
        restaurantProfile.staffPhoneNumber,
        `Nouvelle réservation (IA) : ${reply.reservation.name}, ${reply.reservation.people} pers., ${reply.reservation.time}.`
      );
    }
  }

  await logCall({
    callSid,
    from,
    startedAt: new Date().toISOString(),
    turns: history.length + 1,
    transferred: reply.transfer,
  });

  if (reply.transfer) {
    if (!restaurantProfile.staffPhoneNumber) {
      // No staff number configured — fall back to a polite apology instead of dropping the call.
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
