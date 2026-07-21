import { NextRequest, NextResponse } from "next/server";
import { consumeCallSeconds } from "@/lib/billing";

// Configure this as your Twilio number's "Call status changes" webhook
// (separate field from "A call comes in"), method POST.
// Twilio calls this when a call completes, with the real duration.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const status = String(form.get("CallStatus") || "");
  const duration = Number(form.get("CallDuration") || 0);

  if (status === "completed" && duration > 0) {
    consumeCallSeconds(duration);
  }

  return new NextResponse(null, { status: 204 });
}
