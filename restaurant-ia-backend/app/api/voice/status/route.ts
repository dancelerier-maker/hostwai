import { NextRequest, NextResponse } from "next/server";
import { consumeCallSeconds } from "@/lib/billing";
import { setCallDuration } from "@/lib/store";

// Configure this as your Twilio number's "Call status changes" webhook
// (separate field from "A call comes in"), method POST.
// Twilio calls this when a call completes, with the real duration.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const callSid = String(form.get("CallSid") || "");
  const status = String(form.get("CallStatus") || "");
  const duration = Number(form.get("CallDuration") || 0);

  if (status === "completed" && duration > 0) {
    await consumeCallSeconds(duration);
    if (callSid) await setCallDuration(callSid, duration);
  }

  return new NextResponse(null, { status: 204 });
}
