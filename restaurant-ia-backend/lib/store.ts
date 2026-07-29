import { supabase } from "./supabaseClient";

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

export async function addReservation(restaurantId: string, r: Omit<Reservation, "createdAt">): Promise<void> {
  const { error } = await supabase.from("reservations").insert({
    restaurant_id: restaurantId,
    customer_name: r.name,
    party_size: r.people,
    reservation_time: r.time,
  });
  if (error) {
    console.error("Échec d'enregistrement de la réservation :", error.message);
  }
}

export async function listReservations(restaurantId: string): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select("customer_name, party_size, reservation_time, created_at")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    name: row.customer_name,
    people: row.party_size,
    time: row.reservation_time,
    createdAt: row.created_at,
  }));
}

export async function logCall(restaurantId: string, entry: CallLogEntry): Promise<void> {
  const { error } = await supabase.from("calls").upsert(
    {
      call_sid: entry.callSid,
      restaurant_id: restaurantId,
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

export async function listCalls(restaurantId: string): Promise<CallLogEntry[]> {
  const { data, error } = await supabase
    .from("calls")
    .select("call_sid, phone_number, started_at, status, transcript")
    .eq("restaurant_id", restaurantId)
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

export async function setCallDuration(callSid: string, durationSeconds: number): Promise<void> {
  const { error } = await supabase
    .from("calls")
    .update({ duration_seconds: durationSeconds, status: "completed" })
    .eq("call_sid", callSid)
    .neq("status", "transferred");
  if (error) {
    console.error("Échec de mise à jour de la durée d'appel :", error.message);
  }
}
