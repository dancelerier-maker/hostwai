import { NextResponse } from "next/server";
import { listReservations, listCalls } from "@/lib/store";
import { getCurrentUser } from "@/lib/supabaseServerClient";
import { getOrCreateRestaurantForUser } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const restaurantId = await getOrCreateRestaurantForUser(user.id, user.email ?? null);
  const [reservations, calls] = await Promise.all([
    listReservations(restaurantId),
    listCalls(restaurantId),
  ]);
  return NextResponse.json({ reservations, calls });
}
