import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { setSubscriptionActive } from "@/lib/billing";
import type { PlanId } from "@/lib/plans";

// Configure this URL in the Stripe Dashboard > Developers > Webhooks:
// https://your-domain.com/api/billing/webhook
// Events to send: checkout.session.completed, customer.subscription.deleted
export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook non configuré." }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.text(); // raw body required for signature verification
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const plan = (session.metadata?.plan as PlanId) || "starter";
      await setSubscriptionActive(true, plan);
      break;
    }
    case "customer.subscription.deleted":
      await setSubscriptionActive(false);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
