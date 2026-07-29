"use client";

import { useEffect, useState, useCallback } from "react";
import { Settings2, X, Clock, Users, MessageSquare, LogOut } from "lucide-react";
import { getDictionary, Locale } from "@/lib/i18n";
import LanguageSwitcher from "@/app/LanguageSwitcher";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

type Reservation = { name: string; people: number; time: string; createdAt: string };
type CallLogEntry = { callSid: string; from: string; startedAt: string; turns: number; transferred: boolean };
type Profile = { name: string; hours: string; languages: string; highlights: string };
type Billing = {
  trialSecondsTotal: number;
  trialSecondsRemaining: number;
  subscriptionActive: boolean;
  currentPlan: "starter" | "pro" | "enterprise" | null;
  planName: string | null;
  includedMinutes: number | null;
  minutesUsedThisPeriod: number;
  overageMinutes: number;
  overageRatePerMinute: number | null;
  overageCostThisPeriod: number;
  hasAccess: boolean;
};

function formatMinutes(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}min${s > 0 ? ` ${s}s` : ""}`;
}

function DashboardInner({ params, restaurantId }: { params: { locale: Locale }; restaurantId: string }) {
  const t = getDictionary(params.locale);
  const localeTag = params.locale === "en" ? "en-US" : params.locale === "es" ? "es-ES" : "fr-FR";

  const withRestaurant = useCallback(
    (path: string) => `${path}?restaurantId=${encodeURIComponent(restaurantId)}`,
    [restaurantId]
  );

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = `/${params.locale}/login`;
  }

  const [agentOn, setAgentOnState] = useState<boolean | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [calls, setCalls] = useState<CallLogEntry[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [billing, setBilling] = useState<Billing | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [answerMode, setAnswerModeState] = useState<"immediate" | "delayed" | null>(null);
  const [ringDelaySeconds, setRingDelaySecondsState] = useState(15);
  const [savingMode, setSavingMode] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: "", hours: "", languages: "", highlights: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || "",
        hours: profile.hours || "",
        languages: profile.languages || "",
        highlights: profile.highlights || "",
      });
    }
  }, [profile]);

  async function saveProfile() {
    setSavingProfile(true);
    setProfileSaved(false);
    try {
      const res = await fetch(withRestaurant("/api/profile"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      }).then((r) => r.json());
      setProfile(res);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } finally {
      setSavingProfile(false);
    }
  }

  function statusOf(c: CallLogEntry) {
    if (c.transferred) return { label: t.dashboard.onDesc.startsWith("") ? "Transferred" : "", bg: "#FDECEA", color: "#B3261E" };
    return { label: "", bg: "", color: "" };
  }

  const refresh = useCallback(async () => {
    try {
      const [settingsRes, dataRes, profileRes, billingRes] = await Promise.all([
        fetch(withRestaurant("/api/settings")).then((r) => r.json()),
        fetch(withRestaurant("/api/reservations")).then((r) => r.json()),
        fetch(withRestaurant("/api/profile")).then((r) => r.json()),
        fetch(withRestaurant("/api/billing/status")).then((r) => r.json()),
      ]);
      setAgentOnState(settingsRes.agentOn);
      setAnswerModeState(settingsRes.answerMode);
      setRingDelaySecondsState(settingsRes.ringDelaySeconds ?? 15);
      setReservations(dataRes.reservations || []);
      setCalls(dataRes.calls || []);
      setProfile(profileRes);
      setBilling(billingRes);
    } catch {
      // network hiccup — the next poll will retry
    }
  }, [withRestaurant]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  async function toggleAgent() {
    if (agentOn === null || toggling) return;
    setToggling(true);
    const next = !agentOn;
    setAgentOnState(next);
    try {
      const res = await fetch(withRestaurant("/api/settings"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentOn: next }),
      }).then((r) => r.json());
      setAgentOnState(res.agentOn);
    } catch {
      setAgentOnState(!next);
    } finally {
      setToggling(false);
    }
  }

  const isOn = agentOn === true;

  async function changeAnswerMode(mode: "immediate" | "delayed") {
    if (savingMode || mode === answerMode) return;
    setSavingMode(true);
    const prev = answerMode;
    setAnswerModeState(mode);
    try {
      const res = await fetch(withRestaurant("/api/settings"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerMode: mode }),
      }).then((r) => r.json());
      setAnswerModeState(res.answerMode);
    } catch {
      setAnswerModeState(prev);
    } finally {
      setSavingMode(false);
    }
  }

  async function subscribe(planId: "starter" | "pro" = "starter") {
    setSubscribing(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, restaurantId }),
      }).then((r) => r.json());
      if (res.url) window.location.href = res.url;
      else setSubscribing(false);
    } catch {
      setSubscribing(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-ink font-sans antialiased">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-6">
          <span className="font-display text-[16px] font-bold tracking-tight">Hostwai</span>
          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={params.locale} />
            <button
              onClick={() => setShowSettings((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-inkSoft hover:border-black/20"
            >
              <Settings2 size={16} />
            </button>
            <button
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-inkSoft hover:border-black/20"
              title="Se déconnecter"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {showSettings && (
        <div className="mx-auto max-w-2xl px-6 pt-6">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-inkSoft">{t.dashboard.profileTitle}</p>
              <button onClick={() => setShowSettings(false)} className="text-inkSoft"><X size={16} /></button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-medium text-inkSoft">Nom du restaurant</label>
                <input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Le Bistrot Central"
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[13.5px]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-inkSoft">Horaires</label>
                <textarea
                  value={profileForm.hours}
                  onChange={(e) => setProfileForm((p) => ({ ...p, hours: e.target.value }))}
                  placeholder="Mar-Dim, 12h-14h30 et 19h-22h30. Fermé le lundi."
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[13.5px] resize-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-inkSoft">Langues parlées</label>
                <input
                  value={profileForm.languages}
                  onChange={(e) => setProfileForm((p) => ({ ...p, languages: e.target.value }))}
                  placeholder="Français, Anglais, Espagnol"
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[13.5px]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-inkSoft">Menu / infos utiles</label>
                <textarea
                  value={profileForm.highlights}
                  onChange={(e) => setProfileForm((p) => ({ ...p, highlights: e.target.value }))}
                  placeholder="Cuisine de saison, terrasse, menu végétarien, parking à proximité..."
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[13.5px] resize-none"
                />
              </div>
              <button
                onClick={saveProfile}
                disabled={savingProfile}
                className="rounded-full px-5 py-2 text-[13px] font-medium text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #2E5EFF, #6C4DFF)" }}
              >
                {savingProfile ? "..." : profileSaved ? "Enregistré ✓" : "Enregistrer"}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-inkSoft">{t.dashboard.answerModeLabel}</p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => changeAnswerMode("immediate")}
                className="rounded-xl border p-3.5 text-left transition-colors"
                style={{
                  borderColor: answerMode === "immediate" ? "transparent" : "#EBEAE5",
                  background: answerMode === "immediate" ? "linear-gradient(135deg, #2E5EFF, #6C4DFF)" : "#FAFAF8",
                }}
              >
                <p className="text-[13px] font-semibold" style={{ color: answerMode === "immediate" ? "#fff" : "#14120F" }}>
                  {t.dashboard.answerModeImmediate}
                </p>
                <p className="mt-1 text-[11.5px] leading-snug" style={{ color: answerMode === "immediate" ? "rgba(255,255,255,0.85)" : "#75726A" }}>
                  {t.dashboard.answerModeImmediateDesc}
                </p>
              </button>
              <button
                onClick={() => changeAnswerMode("delayed")}
                className="rounded-xl border p-3.5 text-left transition-colors"
                style={{
                  borderColor: answerMode === "delayed" ? "transparent" : "#EBEAE5",
                  background: answerMode === "delayed" ? "linear-gradient(135deg, #2E5EFF, #6C4DFF)" : "#FAFAF8",
                }}
              >
                <p className="text-[13px] font-semibold" style={{ color: answerMode === "delayed" ? "#fff" : "#14120F" }}>
                  {t.dashboard.answerModeDelayed}
                </p>
                <p className="mt-1 text-[11.5px] leading-snug" style={{ color: answerMode === "delayed" ? "rgba(255,255,255,0.85)" : "#75726A" }}>
                  {t.dashboard.answerModeDelayedDesc(ringDelaySeconds)}
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {billing && (
        <div className="mx-auto max-w-2xl px-6 pt-6">
          {billing.subscriptionActive ? (
            <div
              className="rounded-2xl border p-4"
              style={{
                borderColor: billing.overageMinutes > 0 ? "#FDECEA" : "#EBEAE5",
                background: billing.overageMinutes > 0 ? "#FDECEA" : "#FFFFFF",
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[13.5px] font-medium">{t.dashboard.planLabel(billing.planName || "")}</p>
                <span className="text-[12px] text-inkSoft">
                  {t.dashboard.minutesThisMonth(billing.minutesUsedThisPeriod, billing.includedMinutes || 0)}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-line overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (billing.minutesUsedThisPeriod / (billing.includedMinutes || 1)) * 100)}%`,
                    background: billing.overageMinutes > 0 ? "#B3261E" : "linear-gradient(135deg, #2E5EFF, #6C4DFF)",
                  }}
                />
              </div>
              {billing.overageMinutes > 0 && (
                <p className="mt-2 text-[12px]" style={{ color: "#B3261E" }}>
                  {t.dashboard.overage(billing.overageMinutes, billing.overageCostThisPeriod, billing.overageRatePerMinute || 0)}
                </p>
              )}
            </div>
          ) : (
            <div
              className="flex items-center justify-between gap-4 rounded-2xl border p-4"
              style={{
                borderColor: billing.hasAccess ? "#EBEAE5" : "#FDECEA",
                background: billing.hasAccess ? "#FFF9F0" : "#FDECEA",
              }}
            >
              <div>
                <p className="text-[13.5px] font-medium">
                  {billing.hasAccess ? t.dashboard.trialRemaining(formatMinutes(billing.trialSecondsRemaining)) : t.dashboard.trialOver}
                </p>
                <p className="mt-0.5 text-[12px] text-inkSoft">
                  {billing.hasAccess ? t.dashboard.trialOnDesc : t.dashboard.trialOffDesc}
                </p>
              </div>
              <button
                onClick={() => subscribe("starter")}
                disabled={subscribing}
                className="shrink-0 rounded-full px-4 py-2 text-[13px] font-medium text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #2E5EFF, #6C4DFF)" }}
              >
                {subscribing ? "..." : t.dashboard.choosePlan}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mx-auto max-w-2xl px-6 pt-14 pb-10 flex flex-col items-center text-center">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-inkSoft">{profile?.name || "..."}</p>

        <button
          onClick={toggleAgent}
          disabled={agentOn === null}
          className="relative mt-6 flex h-44 w-44 items-center justify-center rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          style={{
            background: isOn ? "linear-gradient(135deg, #2E5EFF, #6C4DFF)" : "#FFFFFF",
            border: isOn ? "none" : "2px solid #EBEAE5",
            boxShadow: isOn ? "0 12px 32px rgba(255,90,60,0.28)" : "none",
          }}
        >
          {isOn && <span className="absolute inline-flex h-44 w-44 rounded-full bg-coral opacity-35 animate-ringExpand" />}
          <span className="relative flex flex-col items-center">
            <span className="font-display text-[22px] font-bold" style={{ color: isOn ? "#fff" : "#14120F" }}>
              {agentOn === null ? "..." : isOn ? t.dashboard.onLabel : t.dashboard.offLabel}
            </span>
            <span className="mt-1 text-[11.5px] font-medium" style={{ color: isOn ? "rgba(255,255,255,0.85)" : "#75726A" }}>
              {isOn ? t.footer.tagline.split("—")[0].trim() : t.dashboard.offLabel}
            </span>
          </span>
        </button>

        <p className="mt-6 max-w-xs text-[13.5px] leading-relaxed text-inkSoft">
          {isOn ? t.dashboard.onDesc : t.dashboard.offDesc}
        </p>
      </div>

      <div className="mx-auto max-w-2xl px-6 pb-16">
        <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-inkSoft flex items-center gap-2">
          <MessageSquare size={12} /> {t.dashboard.callHistory}
        </p>
        <div className="mt-3 rounded-2xl border border-line bg-surface divide-y divide-line">
          {calls.length === 0 && <p className="px-5 py-6 text-[13.5px] text-inkSoft">{t.dashboard.noCalls}</p>}
          {calls.map((c) => (
            <div key={c.callSid} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-[13.5px] font-medium">{c.from}</p>
                <p className="mt-0.5 text-[12px] text-inkSoft">
                  {new Date(c.startedAt).toLocaleTimeString(localeTag, { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-[11.5px] font-medium"
                style={{
                  background: c.transferred ? "#FDECEA" : c.turns === 0 ? "#F1F0EC" : "#EAF7EE",
                  color: c.transferred ? "#B3261E" : c.turns === 0 ? "#75726A" : "#166534",
                }}
              >
                {c.turns} · {c.transferred ? "→" : "IA"}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-[10px] font-mono uppercase tracking-[0.14em] text-inkSoft flex items-center gap-2">
          <Users size={12} /> {t.dashboard.reservations}
        </p>
        <div className="mt-3 rounded-2xl border border-line bg-surface divide-y divide-line">
          {reservations.length === 0 && <p className="px-5 py-6 text-[13.5px] text-inkSoft">{t.dashboard.noReservations}</p>}
          {reservations.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4">
              <span className="text-[13.5px] font-medium">{r.name}</span>
              <span className="flex items-center gap-3 text-[12px] text-inkSoft">
                <span className="flex items-center gap-1"><Users size={11} />{r.people}</span>
                <span className="flex items-center gap-1"><Clock size={11} />{r.time}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({ params, restaurantId }: { params: { locale: Locale }; restaurantId: string }) {
  return <DashboardInner params={params} restaurantId={restaurantId} />;
}
