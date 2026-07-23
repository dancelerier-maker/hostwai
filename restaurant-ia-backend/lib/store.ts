import { supabase, DEFAULT_RESTAURANT_ID } from "./supabaseClient";

// Remplace les deux tableaux en mémoire par les tables `calls` et
// `reservations`. Mêmes formes de données en sortie qu'avant, pour que
// /api/reservations et le dashboard n'aient rien à changer.

export type Reservation = {
  name: string;
  people: number;
  time: string;
  createdAt: string;
};

export type CallLogEntry = {
  callSid: string;
  from: string;
  startedAt: string;
  turns: number;
  transferred: boolean;
};

export async function addReservation(r: Omit<Reservation, "createdAt">): Promise<void> {
  const { error } = await supabase.from("reservations").insert({
    restaurant_id: DEFAULT_RESTAURANT_ID,
    customer_name: r.name,
    party_size: r.people,
    reservation_time: r.time,
  });

  if (error) {
    console.error("Échec d'enregistrement de la réservation :", error.message);
  }
}

export async function listReservations(): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select("customer_name, party_size, reservation_time, created_at")
    .eq("restaurant_id", DEFAULT_RESTAURANT_ID)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    name: row.customer_name,
    people: row.party_size,
    time: row.reservation_time,
    createdAt: row.created_at,
  }));
}

export async function logCall(entry: CallLogEntry): Promise<void> {
  const { error } = await supabase.from("calls").upsert(
    {
      call_sid: entry.callSid,
      restaurant_id: DEFAULT_RESTAURANT_ID,
      phone_number: entry.from,
      started_at: entry.startedAt,
      status: entry.transferred ? "transferred" : "in_progress",
    },
    { onConflict: "call_sid" }
  );

  if (error) {
    console.error("Échec d'enregistrement de l'appel :", error.message);
  }
}

export async function listCalls(): Promise<CallLogEntry[]> {
  const { data, error } = await supabase
    .from("calls")
    .select("call_sid, phone_number, started_at, status, transcript")
    .eq("restaurant_id", DEFAULT_RESTAURANT_ID)
    .order("started_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    callSid: row.call_sid,
    from: row.phone_number || "unknown",
    startedAt: row.started_at,
    turns: Array.isArray(row.transcript) ? row.transcript.length : 0,
    transferred: row.status === "transferred",
  }));
}

// Appelé depuis le webhook Twilio "Call status changes" quand l'appel se
// termine réellement, pour figer la durée sur la ligne `calls` correspondante.
export async function setCallDuration(callSid: string, durationSeconds: number): Promise<void> {
  const { error } = await supabase
    .from("calls")
    .update({ duration_seconds: durationSeconds, status: "completed" })
    .eq("call_sid", callSid)
    // ne pas écraser un statut "transferred" déjà posé par logCall()
    .neq("status", "transferred");

  if (error) {
    console.error("Échec de mise à jour de la durée d'appel :", error.message);
  }
}
