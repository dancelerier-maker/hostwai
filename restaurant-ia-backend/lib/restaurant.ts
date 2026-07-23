import { supabase, DEFAULT_RESTAURANT_ID } from "./supabaseClient";

export type RestaurantProfile = {
  id: string;
  name: string;
  hours: string;
  languages: string;
  highlights: string;
  staffPhoneNumber: string;
};

// Remplace l'ancien objet statique `restaurantProfile`. Toujours lu depuis
// Supabase — pour éditer le restaurant, modifie la ligne dans `restaurants`
// (pas de UI d'admin dans ce sprint, volontairement).
export async function getRestaurantProfile(): Promise<RestaurantProfile> {
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name, opening_hours, language, highlights, staff_phone_number")
    .eq("id", DEFAULT_RESTAURANT_ID)
    .single();

  if (error || !data) {
    throw new Error(
      `Impossible de charger le profil restaurant (${DEFAULT_RESTAURANT_ID}) : ${error?.message ?? "introuvable"}`
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
