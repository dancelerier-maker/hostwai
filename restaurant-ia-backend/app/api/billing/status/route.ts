import { NextResponse } from "next/server";
import { getBillingStatus } from "@/lib/billing";
import { getCurrentUser } from "@/lib/supabaseServerClient";
import { getOrCreateRestaurantForUser } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const restaurantId = await getOrCreateRestaurantForUser(user.id, user.email ?? null);
  return NextResponse.json(await getBillingStatus(restaurantId));
}
