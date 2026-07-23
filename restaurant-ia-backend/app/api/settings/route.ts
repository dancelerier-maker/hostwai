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

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    agentOn: await getAgentOn(),
    answerMode: await getAnswerMode(),
    ringDelaySeconds: await getRingDelaySeconds(),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  if (typeof body.agentOn === "boolean") {
    await setAgentOn(body.agentOn);
  }

  if (body.answerMode === "immediate" || body.answerMode === "delayed") {
    await setAnswerMode(body.answerMode as AnswerMode);
  }

  if (typeof body.ringDelaySeconds === "number") {
    await setRingDelaySeconds(body.ringDelaySeconds);
  }

  return NextResponse.json({
    agentOn: await getAgentOn(),
    answerMode: await getAnswerMode(),
    ringDelaySeconds: await getRingDelaySeconds(),
  });
}
