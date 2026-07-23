import { supabase, DEFAULT_RESTAURANT_ID } from "./supabaseClient";

// Remplace l'ancien Map en mémoire. Pas de table `conversations` séparée
// (décision produit) : le transcript vit dans `calls.transcript` (jsonb),
// une ligne par appel, clé = call_sid.

export type Turn = { role: "user" | "assistant"; content: string };

export async function getConversation(callSid: string): Promise<Turn[]> {
  const { data } = await supabase
    .from("calls")
    .select("transcript")
    .eq("call_sid", callSid)
    .maybeSingle();

  return (data?.transcript as Turn[]) || [];
}

export async function appendTurn(callSid: string, turn: Turn): Promise<void> {
  const existing = await getConversation(callSid);
  const updated = [...existing, turn];

  // upsert : si l'appel n'a pas encore de ligne dans `calls` (premier tour,
  // avant que logCall() ne tourne), on la crée ici avec le minimum requis.
  const { error } = await supabase
    .from("calls")
    .upsert(
      { call_sid: callSid, restaurant_id: DEFAULT_RESTAURANT_ID, transcript: updated },
      { onConflict: "call_sid" }
    );

  if (error) {
    console.error("Échec d'écriture du transcript :", error.message);
  }
}

export async function clearConversation(callSid: string): Promise<void> {
  await supabase.from("calls").delete().eq("call_sid", callSid);
}
