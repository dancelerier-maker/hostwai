import { NextResponse } from "next/server";
import { getBillingStatus } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getBillingStatus());
}
