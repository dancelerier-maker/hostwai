import { NextResponse } from "next/server";
import { listReservations, listCalls } from "@/lib/store";

// GET /api/reservations -> { reservations, calls }
// The dashboard UI would poll this (or you'd swap it for a websocket/db
// subscription) to show live data instead of the demo data it has today.
export async function GET() {
  return NextResponse.json({
    reservations: listReservations(),
    calls: listCalls(),
  });
}
