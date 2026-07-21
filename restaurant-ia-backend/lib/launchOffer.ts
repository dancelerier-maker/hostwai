// Offre de lancement : -50% pendant les 3 premiers mois, valable jusqu'à une
// date limite. Passé cette date, les nouveaux abonnements repassent au tarif
// plein — les clients déjà inscrits gardent leur réduction jusqu'à la fin de
// leurs 3 mois (c'est Stripe qui gère ça via la durée du coupon, pas ce fichier).

export const LAUNCH_OFFER = {
  active: true,
  discountPercent: 50,
  durationMonths: 3,
  // Modifiable via variable d'env sans redéployer le code.
  deadline: process.env.LAUNCH_OFFER_DEADLINE || "2026-09-30",
};

export function isLaunchOfferActive(): boolean {
  if (!LAUNCH_OFFER.active) return false;
  return new Date() < new Date(LAUNCH_OFFER.deadline);
}
