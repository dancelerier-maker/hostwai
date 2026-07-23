import { supabase, DEFAULT_RESTAURANT_ID } from "./supabaseClient";

// Remplace l'ancien état en mémoire (variables globales, perdues à chaque
// redémarrage / entre instances serverless) par la table `settings`.

export type AnswerMode = "immediate" | "delayed";

export type Settings = {
  agentOn: boolean;
  answerMode: AnswerMode;
  ringDelaySeconds: number;
};

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabase
    .from("settings")
    .select("agent_enabled, answer_mode, ring_delay_seconds")
    .eq("restaurant_id", DEFAULT_RESTAURANT_ID)
    .single();

  if (error || !data) {
    throw new Error(`Impossible de charger les réglages : ${error?.message ?? "introuvable"}`);
  }

  return {
    agentOn: data.agent_enabled,
    answerMode: data.answer_mode as AnswerMode,
    ringDelaySeconds: data.ring_delay_seconds,
  };
}

export async function getAgentOn(): Promise<boolean> {
  return (await getSettings()).agentOn;
}

export async function setAgentOn(value: boolean): Promise<boolean> {
  await supabase.from("settings").update({ agent_enabled: value }).eq("restaurant_id", DEFAULT_RESTAURANT_ID);
  return value;
}

export async function getAnswerMode(): Promise<AnswerMode> {
  return (await getSettings()).answerMode;
}

export async function setAnswerMode(value: AnswerMode): Promise<AnswerMode> {
  await supabase.from("settings").update({ answer_mode: value }).eq("restaurant_id", DEFAULT_RESTAURANT_ID);
  return value;
}

export async function getRingDelaySeconds(): Promise<number> {
  return (await getSettings()).ringDelaySeconds;
}

export async function setRingDelaySeconds(value: number): Promise<number> {
  // garde-fou : entre 5 et 45 secondes, pour éviter un réglage absurde (comportement identique à avant)
  const clamped = Math.max(5, Math.min(45, Math.round(value)));
  await supabase.from("settings").update({ ring_delay_seconds: clamped }).eq("restaurant_id", DEFAULT_RESTAURANT_ID);
  return clamped;
}
