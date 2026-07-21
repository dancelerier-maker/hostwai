import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

// Fails silently (logs only) — an SMS that doesn't go out shouldn't crash the
// call or block the reservation from being saved. Twilio trial accounts can
// only text verified numbers; that's expected during testing.
export async function sendSms(to: string, body: string): Promise<boolean> {
  if (!client || !fromNumber) {
    console.warn("SMS non envoyé : Twilio (SID/token/numéro) non configuré.");
    return false;
  }
  try {
    await client.messages.create({ to, from: fromNumber, body });
    return true;
  } catch (err) {
    console.error("Échec d'envoi SMS :", err);
    return false;
  }
}
