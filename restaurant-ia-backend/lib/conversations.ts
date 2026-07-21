// In-memory store, keyed by Twilio CallSid. Good enough for a single-instance
// prototype. For production (multiple server instances, restarts), swap this
// for Redis, Vercel KV, or a database table keyed by call_sid.

export type Turn = { role: "user" | "assistant"; content: string };

const conversations = new Map<string, Turn[]>();

export function getConversation(callSid: string): Turn[] {
  return conversations.get(callSid) || [];
}

export function appendTurn(callSid: string, turn: Turn) {
  const existing = conversations.get(callSid) || [];
  existing.push(turn);
  conversations.set(callSid, existing);
}

export function clearConversation(callSid: string) {
  conversations.delete(callSid);
}
