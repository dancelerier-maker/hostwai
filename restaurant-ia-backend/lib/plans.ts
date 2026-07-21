export type PlanId = "starter" | "pro" | "enterprise";

export type Plan = {
  id: PlanId;
  name: string;
  priceMonthly: number | null; // null = "sur devis" (enterprise)
  includedMinutes: number | null; // null = volume personnalisé
  overageRatePerMinute: number | null; // €/minute au-delà du forfait
  stripePriceEnvVar?: string; // which env var holds this plan's Stripe price ID
};

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 99,
    includedMinutes: 100,
    overageRatePerMinute: 0.30,
    stripePriceEnvVar: "STRIPE_PRICE_ID_STARTER",
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 249,
    includedMinutes: 500,
    overageRatePerMinute: 0.25,
    stripePriceEnvVar: "STRIPE_PRICE_ID_PRO",
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: null,
    includedMinutes: null,
    overageRatePerMinute: null,
  },
};

// Coût d'infra estimé, pour calculer la marge — pas affiché au client, sert
// juste de repère interne. À ajuster selon les modèles/outils réels utilisés.
export const ESTIMATED_COST_PER_MINUTE = 0.15;
