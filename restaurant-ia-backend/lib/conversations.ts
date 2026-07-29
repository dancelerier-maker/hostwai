import { supabase } from "./supabaseClient";

export type Turn = { role: "user" | "assistant"; content: string };

export async function getConversation(callSid: string): Promise<Turn[]> {
  const { data } = await supabase
    .from("calls")
    .select("transcript")
    .eq("call_sid", callSid)
    .maybeSingle();

  return (data?.transcript as Turn[]) || [];
}

export async function appendTurn(restaurantId: string, callSid: string, turn: Turn): Promise<void> {
  const existing = await getConversation(callSid);
  const updated = [...existing, turn];
  const { error } = await supabase
    .from("calls")
    .upsert(
      { call_sid: callSid, restaurant_id: restaurantId, transcript: updated },
      { onConflict: "call_sid" }
    );
  if (error) {
    console.error("Échec d'écriture du transcript :", error.message);
  }
}

export async function clearConversation(callSid: string): Promise<void> {
  await supabase.from("calls").delete().eq("call_sid", callSid);
}
