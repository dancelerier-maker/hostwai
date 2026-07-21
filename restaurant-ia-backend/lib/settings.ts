// Same in-memory caveat as store.ts / conversations.ts — fine for a single
// instance prototype, swap for a database row before going to production
// with real traffic across multiple server instances.

export type AnswerMode = "immediate" | "delayed";

let agentOn = true;
let answerMode: AnswerMode = "immediate";
let ringDelaySeconds = 15; // used only when answerMode === "delayed"

export function getAgentOn(): boolean {
  return agentOn;
}

export function setAgentOn(value: boolean): boolean {
  agentOn = value;
  return agentOn;
}

export function getAnswerMode(): AnswerMode {
  return answerMode;
}

export function setAnswerMode(value: AnswerMode): AnswerMode {
  answerMode = value;
  return answerMode;
}

export function getRingDelaySeconds(): number {
  return ringDelaySeconds;
}

export function setRingDelaySeconds(value: number): number {
  // garde-fou : entre 5 et 45 secondes, pour éviter un réglage absurde
  ringDelaySeconds = Math.max(5, Math.min(45, Math.round(value)));
  return ringDelaySeconds;
}
