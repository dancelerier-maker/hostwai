import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    "Supabase non configuré : SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY manquants."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceRoleKey || "placeholder",
  { auth: { persistSession: false } }
);

export const DEFAULT_RESTAURANT_ID =
  process.env.DEFAULT_RESTAURANT_ID || "00000000-0000-0000-0000-000000000001";

export async function getRestaurantIdByTwilioNumber(twilioNumber: string): Promise<string | null> {
  if (!twilioNumber) return null;
  const { data, error } = await supabase
    .from("restaurants")
    .select("id")
    .eq("twilio_number", twilioNumber)
    .maybeSingle();
  if (error || !data) return null;
  return data.id as string;
}

export async function getOrCreateRestaurantForUser(userId: string, userEmail: string | null): Promise<string> {
  const { data: existing } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data: created, error } = await supabase
    .from("restaurants")
    .insert({
      owner_user_id: userId,
      name: "Mon restaurant",
      language: "Français",
      opening_hours: "À compléter dans les réglages.",
      highlights: "À compléter dans les réglages.",
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(`Impossible de créer le restaurant pour ${userEmail ?? userId} : ${error?.message ?? "erreur inconnue"}`);
  }

  const restaurantId = created.id as string;

  await supabase.from("settings").insert({ restaurant_id: restaurantId });
  await supabase.from("subscriptions").insert({ restaurant_id: restaurantId });

  return restaurantId;
}
