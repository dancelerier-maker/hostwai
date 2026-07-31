import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { setSubscriptionActive } from "@/lib/billing";
import type { PlanId } from "@/lib/plans";
import { DEFAULT_RESTAURANT_ID } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook non configuré." }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const plan = (session.metadata?.plan as PlanId) || "starter";
      const restaurantId = session.metadata?.restaurantId || DEFAULT_RESTAURANT_ID;
      await setSubscriptionActive(restaurantId, true, plan);
      break;
    }
    case "customer.subscription.deleted": {
      // LIMITE CONNUE : cet événement Stripe ne contient pas directement le
      // restaurantId. Tant qu'il n'y a qu'une poignée de clients, gère les
      // résiliations manuellement dans Supabase.
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
