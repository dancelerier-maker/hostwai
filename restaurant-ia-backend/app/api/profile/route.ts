import { NextResponse } from "next/server";
import { getRestaurantProfile } from "@/lib/restaurant";

export const dynamic = "force-dynamic";

export async function GET() {
  const { name, hours, languages, highlights } = await getRestaurantProfile();
  return NextResponse.json({ name, hours, languages, highlights });
}
