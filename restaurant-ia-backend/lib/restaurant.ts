import { supabase } from "./supabaseClient";

export type RestaurantProfile = {
  id: string;
  name: string;
  hours: string;
  languages: string;
  highlights: string;
  staffPhoneNumber: string;
};

export async function getRestaurantProfile(restaurantId: string): Promise<RestaurantProfile> {
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name, opening_hours, language, highlights, staff_phone_number")
    .eq("id", restaurantId)
    .single();
  if (error || !data) {
    throw new Error(
      `Impossible de charger le profil restaurant (${restaurantId}) : ${error?.message ?? "introuvable"}`
    );
  }
  return {
    id: data.id,
    name: data.name,
    hours: data.opening_hours || "",
    languages: data.language || "",
    highlights: data.highlights || "",
    staffPhoneNumber: data.staff_phone_number || "",
  };
}

export type RestaurantProfileUpdate = {
  name?: string;
  hours?: string;
  languages?: string;
  highlights?: string;
  staffPhoneNumber?: string;
};

export async function updateRestaurantProfile(restaurantId: string, update: RestaurantProfileUpdate): Promise<void> {
  const payload: Record<string, string> = {};
  if (update.name !== undefined) payload.name = update.name;
  if (update.hours !== undefined) payload.opening_hours = update.hours;
  if (update.languages !== undefined) payload.language = update.languages;
  if (update.highlights !== undefined) payload.highlights = update.highlights;
  if (update.staffPhoneNumber !== undefined) payload.staff_phone_number = update.staffPhoneNumber;

  if (Object.keys(payload).length === 0) return;

  const { error } = await supabase.from("restaurants").update(payload).eq("id", restaurantId);
  if (error) {
    throw new Error(`Impossible de mettre à jour le profil restaurant (${restaurantId}) : ${error.message}`);
  }
}
