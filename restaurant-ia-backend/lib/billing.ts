import { PLANS, PlanId, Plan } from "./plans";

// Same in-memory caveat as the other lib/*.ts stores — swap for a database
// row (keyed by restaurant/account) before going to production. In
// particular, minutesUsedThisPeriod should reset every billing cycle
// (a cron job or a check against the Stripe subscription's current period)
// — here it just accumulates, fine for a single-restaurant prototype.

const TRIAL_SECONDS_TOTAL = 60 * 60; // 1 heure offerte avant de choisir un forfait

let trialSecondsRemaining = TRIAL_SECONDS_TOTAL;
let subscriptionActive = false;
let currentPlan: PlanId | null = null;
let secondsUsedThisPeriod = 0;

export function getBillingStatus() {
  const plan: Plan | null = currentPlan ? PLANS[currentPlan] : null;
  const minutesUsed = Math.ceil(secondsUsedThisPeriod / 60);
  const includedMinutes = plan?.includedMinutes ?? null;
  const overageMinutes = includedMinutes !== null ? Math.max(0, minutesUsed - includedMinutes) : 0;
  const overageCost = plan?.overageRatePerMinute ? overageMinutes * plan.overageRatePerMinute : 0;

  return {
    trialSecondsTotal: TRIAL_SECONDS_TOTAL,
    trialSecondsRemaining,
    subscriptionActive,
    currentPlan,
    planName: plan?.name ?? null,
    includedMinutes,
    minutesUsedThisPeriod: minutesUsed,
    overageMinutes,
    overageRatePerMinute: plan?.overageRatePerMinute ?? null,
    overageCostThisPeriod: Number(overageCost.toFixed(2)),
    hasAccess: subscriptionActive || trialSecondsRemaining > 0,
  };
}

// Called from the Twilio call-status webhook once a call actually completes,
// with its real duration.
export function consumeCallSeconds(seconds: number) {
  if (subscriptionActive) {
    secondsUsedThisPeriod += seconds;
  } else {
    trialSecondsRemaining = Math.max(0, trialSecondsRemaining - seconds);
  }
}

export function setSubscriptionActive(value: boolean, plan?: PlanId) {
  subscriptionActive = value;
  if (value && plan) currentPlan = plan;
  if (!value) currentPlan = null;
}

// For a real deploy: call this at the start of each Stripe billing period
// (e.g. from an "invoice.created" webhook event) to reset the counter.
export function resetPeriodUsage() {
  secondsUsedThisPeriod = 0;
}
