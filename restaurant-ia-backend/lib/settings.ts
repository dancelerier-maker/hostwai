import { supabase } from "./supabaseClient";

export type AnswerMode = "immediate" | "delayed";

export type Settings = {
  agentOn: boolean;
  answerMode: AnswerMode;
  ringDelaySeconds: number;
};

export async function getSettings(restaurantId: string): Promise<Settings> {
  const { data, error } = await supabase
    .from("settings")
    .select("agent_enabled, answer_mode, ring_delay_seconds")
    .eq("restaurant_id", restaurantId)
    .single();
  if (error || !data) {
    throw new Error(`Impossible de charger les réglages (${restaurantId}) : ${error?.message ?? "introuvable"}`);
  }
  return {
    agentOn: data.agent_enabled,
    answerMode: data.answer_mode as AnswerMode,
    ringDelaySeconds: data.ring_delay_seconds,
  };
}

export async function getAgentOn(restaurantId: string): Promise<boolean> {
  return (await getSettings(restaurantId)).agentOn;
}

export async function setAgentOn(restaurantId: string, value: boolean): Promise<boolean> {
  await supabase.from("settings").update({ agent_enabled: value }).eq("restaurant_id", restaurantId);
  return value;
}

export async function getAnswerMode(restaurantId: string): Promise<AnswerMode> {
  return (await getSettings(restaurantId)).answerMode;
}

export async function setAnswerMode(restaurantId: string, value: AnswerMode): Promise<AnswerMode> {
  await supabase.from("settings").update({ answer_mode: value }).eq("restaurant_id", restaurantId);
  return value;
}

export async function getRingDelaySeconds(restaurantId: string): Promise<number> {
  return (await getSettings(restaurantId)).ringDelaySeconds;
}

export async function setRingDelaySeconds(restaurantId: string, value: number): Promise<number> {
  const clamped = Math.max(5, Math.min(45, Math.round(value)));
  await supabase.from("settings").update({ ring_delay_seconds: clamped }).eq("restaurant_id", restaurantId);
  return clamped;
}
