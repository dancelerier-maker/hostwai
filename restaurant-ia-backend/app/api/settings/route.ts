import { NextRequest, NextResponse } from "next/server";
import {
  getAgentOn,
  setAgentOn,
  getAnswerMode,
  setAnswerMode,
  getRingDelaySeconds,
  setRingDelaySeconds,
  AnswerMode,
} from "@/lib/settings";
import { getCurrentUser } from "@/lib/supabaseServerClient";
import { getOrCreateRestaurantForUser } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

async function requireRestaurantId(): Promise<string | NextResponse> {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  return getOrCreateRestaurantForUser(user.id, user.email ?? null);
}

export async function GET() {
  const restaurantId = await requireRestaurantId();
  if (restaurantId instanceof NextResponse) return restaurantId;

  return NextResponse.json({
    agentOn: await getAgentOn(restaurantId),
    answerMode: await getAnswerMode(restaurantId),
    ringDelaySeconds: await getRingDelaySeconds(restaurantId),
  });
}

export async function POST(req: NextRequest) {
  const restaurantId = await requireRestaurantId();
  if (restaurantId instanceof NextResponse) return restaurantId;

  const body = await req.json().catch(() => ({}));

  if (typeof body.agentOn === "boolean") {
    await setAgentOn(restaurantId, body.agentOn);
  }
  if (body.answerMode === "immediate" || body.answerMode === "delayed") {
    await setAnswerMode(restaurantId, body.answerMode as AnswerMode);
  }
  if (typeof body.ringDelaySeconds === "number") {
    await setRingDelaySeconds(restaurantId, body.ringDelaySeconds);
  }

  return NextResponse.json({
    agentOn: await getAgentOn(restaurantId),
    answerMode: await getAnswerMode(restaurantId),
    ringDelaySeconds: await getRingDelaySeconds(restaurantId),
  });
}
