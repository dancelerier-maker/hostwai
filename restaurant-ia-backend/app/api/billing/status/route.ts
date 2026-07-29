import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PLANS, PlanId } from "@/lib/plans";
import { getCurrentUser } from "@/lib/supabaseServerClient";
import { getOrCreateRestaurantForUser } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  const restaurantId = await getOrCreateRestaurantForUser(user.id, user.email ?? null);

  const body = await req.json().catch(() => ({}));
  const planId: PlanId = body.plan === "pro" ? "pro" : "starter";
  const plan = PLANS[planId];

  if (!plan.stripePriceEnvVar) {
    return NextResponse.json({ error: "Ce forfait n'a pas de paiement en ligne (contact commercial)." }, { status: 400 });
  }

  const priceId = process.env[plan.stripePriceEnvVar];
  if (!process.env.STRIPE_SECRET_KEY || !priceId) {
    return NextResponse.json(
      { error: `Stripe n'est pas configuré (STRIPE_SECRET_KEY / ${plan.stripePriceEnvVar} manquants).` },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { plan: planId, restaurantId },
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/dashboard?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
