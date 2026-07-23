import { PLANS, PlanId, Plan } from "./plans";
import { supabase, DEFAULT_RESTAURANT_ID } from "./supabaseClient";

// Remplace l'état en mémoire par la table `subscriptions`. Les constantes
// (durée d'essai, tarifs des forfaits) restent dans le code, comme avant —
// seul l'état mutable (secondes restantes/utilisées, abonnement actif) va en base.

const TRIAL_SECONDS_TOTAL = 60 * 60; // 1 heure offerte avant de choisir un forfait

type SubscriptionRow = {
  trial_seconds_remaining: number;
  seconds_used_this_period: number;
  plan: PlanId | null;
  subscription_active: boolean;
};

async function getSubscriptionRow(): Promise<SubscriptionRow> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("trial_seconds_remaining, seconds_used_this_period, plan, subscription_active")
    .eq("restaurant_id", DEFAULT_RESTAURANT_ID)
    .single();

  if (error || !data) {
    throw new Error(`Impossible de charger l'abonnement : ${error?.message ?? "introuvable"}`);
  }

  return data as SubscriptionRow;
}

export async function getBillingStatus() {
  const row = await getSubscriptionRow();
  const plan: Plan | null = row.plan ? PLANS[row.plan] : null;
  const minutesUsed = Math.ceil(row.seconds_used_this_period / 60);
  const includedMinutes = plan?.includedMinutes ?? null;
  const overageMinutes = includedMinutes !== null ? Math.max(0, minutesUsed - includedMinutes) : 0;
  const overageCost = plan?.overageRatePerMinute ? overageMinutes * plan.overageRatePerMinute : 0;

  return {
    trialSecondsTotal: TRIAL_SECONDS_TOTAL,
    trialSecondsRemaining: row.trial_seconds_remaining,
    subscriptionActive: row.subscription_active,
    currentPlan: row.plan,
    planName: plan?.name ?? null,
    includedMinutes,
    minutesUsedThisPeriod: minutesUsed,
    overageMinutes,
    overageRatePerMinute: plan?.overageRatePerMinute ?? null,
    overageCostThisPeriod: Number(overageCost.toFixed(2)),
    hasAccess: row.subscription_active || row.trial_seconds_remaining > 0,
  };
}

// Appelé depuis le webhook Twilio "Call status changes" une fois l'appel
// terminé, avec sa durée réelle.
export async function consumeCallSeconds(seconds: number): Promise<void> {
  const row = await getSubscriptionRow();

  if (row.subscription_active) {
    await supabase
      .from("subscriptions")
      .update({ seconds_used_this_period: row.seconds_used_this_period + seconds })
      .eq("restaurant_id", DEFAULT_RESTAURANT_ID);
  } else {
    const remaining = Math.max(0, row.trial_seconds_remaining - seconds);
    await supabase
      .from("subscriptions")
      .update({ trial_seconds_remaining: remaining })
      .eq("restaurant_id", DEFAULT_RESTAURANT_ID);
  }
}

export async function setSubscriptionActive(value: boolean, plan?: PlanId): Promise<void> {
  await supabase
    .from("subscriptions")
    .update({
      subscription_active: value,
      plan: value ? plan ?? null : null,
    })
    .eq("restaurant_id", DEFAULT_RESTAURANT_ID);
}

// Pour un vrai déploiement : à appeler au début de chaque période de
// facturation (webhook Stripe "invoice.created") pour remettre le compteur à zéro.
export async function resetPeriodUsage(): Promise<void> {
  await supabase
    .from("subscriptions")
    .update({ seconds_used_this_period: 0 })
    .eq("restaurant_id", DEFAULT_RESTAURANT_ID);
}
