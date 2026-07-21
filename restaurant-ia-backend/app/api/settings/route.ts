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

export async function GET() {
  return NextResponse.json({
    agentOn: getAgentOn(),
    answerMode: getAnswerMode(),
    ringDelaySeconds: getRingDelaySeconds(),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  if (typeof body.agentOn === "boolean") {
    setAgentOn(body.agentOn);
  }

  if (body.answerMode === "immediate" || body.answerMode === "delayed") {
    setAnswerMode(body.answerMode as AnswerMode);
  }

  if (typeof body.ringDelaySeconds === "number") {
    setRingDelaySeconds(body.ringDelaySeconds);
  }

  return NextResponse.json({
    agentOn: getAgentOn(),
    answerMode: getAnswerMode(),
    ringDelaySeconds: getRingDelaySeconds(),
  });
}
