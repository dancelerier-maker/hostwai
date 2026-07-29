import { NextRequest, NextResponse } from "next/server";
import { getRestaurantIdByTwilioNumber } from "@/lib/supabaseClient";
import { consumeCallSeconds } from "@/lib/billing";
import { setCallDuration } from "@/lib/store";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const callSid = String(form.get("CallSid") || "");
  const to = String(form.get("To") || "");
  const status = String(form.get("CallStatus") || "");
  const duration = Number(form.get("CallDuration") || 0);

  if (status === "completed" && duration > 0) {
    const restaurantId = await getRestaurantIdByTwilioNumber(to);
    if (restaurantId) await consumeCallSeconds(restaurantId, duration);
    if (callSid) await setCallDuration(callSid, duration);
  }

  return new NextResponse(null, { status: 204 });
}
