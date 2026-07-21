// Edit this to match your restaurant. In a multi-restaurant version, this
// would be looked up per Twilio phone number (the "To" field of the call).
export const restaurantProfile = {
  name: "Le Bistrot Central",
  hours: "Mardi à dimanche, 12h-14h30 et 19h-22h30. Fermé le lundi.",
  languages: "Français, Anglais, Espagnol",
  highlights:
    "Cuisine française de saison, terrasse, menu végétarien disponible, un chien est le bienvenu en terrasse.",
  // Number to transfer to when the AI can't handle the call (E.164 format, e.g. +33612345678)
  staffPhoneNumber: process.env.STAFF_PHONE_NUMBER || "",
};
