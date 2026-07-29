import { NextRequest, NextResponse } from "next/server";
import { getRestaurantProfile, updateRestaurantProfile } from "@/lib/restaurant";
import { getCurrentUser } from "@/lib/supabaseServerClient";
import { getOrCreateRestaurantForUser } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const restaurantId = await getOrCreateRestaurantForUser(user.id, user.email ?? null);
  const { name, hours, languages, highlights } = await getRestaurantProfile(restaurantId);
  return NextResponse.json({ name, hours, languages, highlights });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const restaurantId = await getOrCreateRestaurantForUser(user.id, user.email ?? null);
  const body = await req.json().catch(() => ({}));

  await updateRestaurantProfile(restaurantId, {
    name: typeof body.name === "string" ? body.name : undefined,
    hours: typeof body.hours === "string" ? body.hours : undefined,
    languages: typeof body.languages === "string" ? body.languages : undefined,
    highlights: typeof body.highlights === "string" ? body.highlights : undefined,
  });

  const { name, hours, languages, highlights } = await getRestaurantProfile(restaurantId);
  return NextResponse.json({ name, hours, languages, highlights });
}
