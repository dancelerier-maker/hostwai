import { PLANS, PlanId, Plan } from "./plans";
import { supabase } from "./supabaseClient";

const TRIAL_SECONDS_TOTAL = 60 * 60;

type SubscriptionRow = {
  trial_seconds_remaining: number;
  seconds_used_this_period: number;
  plan: PlanId | null;
  subscription_active: boolean;
};

async function getSubscriptionRow(restaurantId: string): Promise<SubscriptionRow> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("trial_seconds_remaining, seconds_used_this_period, plan, subscription_active")
    .eq("restaurant_id", restaurantId)
    .single();
  if (error || !data) {
    throw new Error(`Impossible de charger l'abonnement (${restaurantId}) : ${error?.message ?? "introuvable"}`);
  }
  return data as SubscriptionRow;
}

export async function getBillingStatus(restaurantId: string) {
  const row = await getSubscriptionRow(restaurantId);
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

export async function consumeCallSeconds(restaurantId: string, seconds: number): Promise<void> {
  const row = await getSubscriptionRow(restaurantId);
  if (row.subscription_active) {
    await supabase
      .from("subscriptions")
      .update({ seconds_used_this_period: row.seconds_used_this_period + seconds })
      .eq("restaurant_id", restaurantId);
  } else {
    const remaining = Math.max(0, row.trial_seconds_remaining - seconds);
    await supabase
      .from("subscriptions")
      .update({ trial_seconds_remaining: remaining })
      .eq("restaurant_id", restaurantId);
  }
}

export async function setSubscriptionActive(restaurantId: string, value: boolean, plan?: PlanId): Promise<void> {
  await supabase
    .from("subscriptions")
    .update({
      subscription_active: value,
      plan: value ? plan ?? null : null,
    })
    .eq("restaurant_id", restaurantId);
}

export async function resetPeriodUsage(restaurantId: string): Promise<void> {
  await supabase
    .from("subscriptions")
    .update({ seconds_used_this_period: 0 })
    .eq("restaurant_id", restaurantId);
}
