import { NextResponse } from "next/server";
import { listReservations, listCalls } from "@/lib/store";

export const dynamic = "force-dynamic";

// GET /api/reservations -> { reservations, calls }
// Lit maintenant Supabase au lieu des tableaux en mémoire — même forme de
// réponse qu'avant, donc rien à changer côté dashboard.
export async function GET() {
  const [reservations, calls] = await Promise.all([listReservations(), listCalls()]);
  return NextResponse.json({ reservations, calls });
}
