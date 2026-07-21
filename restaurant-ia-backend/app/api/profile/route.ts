import { NextResponse } from "next/server";
import { restaurantProfile } from "@/lib/restaurant";

export async function GET() {
  const { name, hours, languages, highlights } = restaurantProfile;
  return NextResponse.json({ name, hours, languages, highlights });
}
