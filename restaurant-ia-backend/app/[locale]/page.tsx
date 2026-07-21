import Link from "next/link";
import { MessageSquareText, CalendarCheck, Languages, PhoneForwarded, MessageSquare, X, Check, ShieldCheck, CreditCard, Ban } from "lucide-react";
import { getDictionary, Locale } from "@/lib/i18n";
import { isLaunchOfferActive } from "@/lib/launchOffer";
import LanguageSwitcher from "@/app/LanguageSwitcher";

const featureIcons = [MessageSquareText, CalendarCheck, Languages, PhoneForwarded];
const trustIcons = [CreditCard, Ban, ShieldCheck];
const grad = { background: "linear-gradient(135deg, #2E5EFF, #6C4DFF)" };

export default function Home({ params }: { params: { locale: Locale } }) {
  const t = getDictionary(params.locale);
  const offerActive = isLaunchOfferActive();

  return (
    <div className="min-h-screen bg-bg text-ink font-sans antialiased">
      {/* NAV */}
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <span className="font-display text-[16px] font-bold tracking-tight">Hostwai</span>
          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={params.locale} />
            <Link href={`/${params.locale}/dashboard`} className="rounded-full px-5 py-2 text-[13.5px] font-medium text-white transition-opacity hover:opacity-90" style={grad}>
              {t.nav.openDashboard}
            </Link>
          </div>
        </div>
      </header>

      {offerActive && (
        <div className="py-2.5 text-center text-[12.5px] font-medium text-white" style={grad}>
          🔥 {t.pricing.launchOffer}
        </div>
      )}

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-8 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald" />
            <span className="text-[13px] font-medium text-inkSoft">{t.badge}</span>
          </div>

          <h1 className="font-display mt-6 text-[2.6rem] sm:text-[3.1rem] font-bold leading-[1.04] tracking-tight">
            {t.hero.title}
          </h1>
          <p className="mx-auto lg:mx-0 mt-5 max-w-xl text-[15.5px] leading-relaxed text-inkSoft">{t.hero.subtitle}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <Link href={`/${params.locale}/dashboard`} className="rounded-full px-7 py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90" style={{ ...grad, boxShadow: "0 10px 24px rgba(46,94,255,0.3)" }}>
              {t.hero.cta}
            </Link>
            <a href="#how-it-works" className="px-4 py-3.5 text-[15px] font-medium text-inkSoft hover:text-ink transition-colors">
              {t.hero.howItWorks}
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-[12px] text-inkSoft">
            {t.hero.trust.map((label, i) => {
              const Icon = trustIcons[i];
              return (
                <span key={label} className="flex items-center gap-1.5">
                  <Icon size={13} /> {label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Live call snippet — the real proof */}
        <div className="mx-auto w-full max-w-[320px]">
          <div className="rounded-2xl overflow-hidden border border-line bg-surface shadow-[0_1px_2px_rgba(20,18,15,0.04),0_24px_48px_-12px_rgba(20,18,15,0.18)]">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-line">
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
              <span className="ml-3 flex items-center gap-1.5 text-[11px] font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> {t.callSnippet.badge}
              </span>
            </div>
            <div className="p-4 space-y-2.5 bg-bg" style={{ minHeight: 340 }}>
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-3.5 py-2 text-[12px] leading-snug bg-ink text-white">
                  {t.callSnippet.greeting}
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm px-3.5 py-2 text-[12px] leading-snug text-white" style={grad}>
                  {t.callSnippet.caller1}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-3.5 py-2 text-[12px] leading-snug bg-ink text-white">
                  {t.callSnippet.agentReply}
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm px-3.5 py-2 text-[12px] leading-snug text-white" style={grad}>
                  {t.callSnippet.caller2}
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm px-3.5 py-2 text-[12px] leading-snug text-white" style={grad}>
                  {t.callSnippet.question}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-3.5 py-2 text-[12px] leading-snug bg-ink text-white">
                  {t.callSnippet.answer}
                </div>
              </div>
              <div className="rounded-xl border px-3.5 py-2.5 flex items-center justify-between" style={{ borderColor: "#BFD1FF", background: "#EEF2FF" }}>
                <span className="flex items-center gap-2 text-[11.5px] font-semibold" style={{ color: "#1E3FCC" }}>
                  <Check size={13} /> Martin · 4 · 20:30
                </span>
                <span className="text-[10px] font-medium" style={{ color: "#1E3FCC" }}>{t.callSnippet.confirmed}</span>
              </div>
              <div className="flex items-center gap-2 text-[10.5px]" style={{ color: "#75726A" }}>
                <MessageSquareText size={12} style={{ color: "#16A34A" }} /> {t.callSnippet.smsSent}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-14">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-center text-[11px] font-mono uppercase tracking-[0.14em] text-coral">{t.stats.title}</p>
          <div className="mt-9 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {t.stats.items.map((s) => (
              <div key={s.label} className="rounded-2xl border border-line bg-surface p-7 text-center shadow-[0_1px_2px_rgba(20,18,15,0.03),0_12px_24px_-12px_rgba(20,18,15,0.08)]">
                <p className="font-display text-[2.3rem] font-bold tracking-tight" style={{ background: grad.background, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {s.value}
                </p>
                <p className="mt-2.5 text-[12.5px] leading-snug text-inkSoft">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVANT / APRÈS */}
      <section className="py-16 bg-surface border-y border-line">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="font-display text-center text-[1.6rem] font-bold tracking-tight">{t.comparison.title}</h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="rounded-2xl border p-7" style={{ borderColor: "#F3D6D6", background: "#FDF4F4" }}>
              <p className="text-[12px] font-mono uppercase tracking-[0.12em]" style={{ color: "#B3261E" }}>{t.comparison.withoutLabel}</p>
              <ul className="mt-4 space-y-3">
                {t.comparison.withoutList.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13.5px] leading-snug" style={{ color: "#5C2323" }}>
                    <X size={15} className="mt-0.5 shrink-0" style={{ color: "#B3261E" }} /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border p-7" style={{ borderColor: "#C9D6FF", background: "#F0F4FF" }}>
              <p className="text-[12px] font-mono uppercase tracking-[0.12em]" style={{ color: "#1E3FCC" }}>{t.comparison.withLabel}</p>
              <ul className="mt-4 space-y-3">
                {t.comparison.withList.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13.5px] leading-snug" style={{ color: "#1A2A6B" }}>
                    <Check size={15} className="mt-0.5 shrink-0" style={{ color: "#1E3FCC" }} /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-display text-center text-[1.6rem] font-bold tracking-tight">{t.features.title}</h2>
          <div className="mt-11 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {t.features.items.map((f, i) => {
              const Icon = featureIcons[i];
              return (
                <div key={f.title} className="rounded-2xl border border-line bg-surface p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={grad}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <h3 className="mt-4 text-[15.5px] font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-inkSoft">{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 bg-surface border-t border-line">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="font-display text-[1.6rem] font-bold tracking-tight">{t.pricing.title}</h2>
            <p className="mt-3 text-[14px] text-inkSoft">{t.pricing.subtitle}</p>
          </div>

          <div className="mt-11 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-line bg-bg p-8">
              <p className="text-[12.5px] font-mono uppercase tracking-[0.14em] text-inkSoft">{t.pricing.starter.name}</p>
              <p className="font-display mt-2 text-[2.1rem] font-bold tracking-tight">
                99€<span className="text-[14px] font-normal text-inkSoft">{t.pricing.starter.period}</span>
              </p>
              <p className="mt-2 text-[13px] text-inkSoft">{t.pricing.starter.detail}</p>
              <Link href={`/${params.locale}/dashboard`} className="mt-6 block rounded-full px-6 py-3 text-center text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90" style={grad}>
                {t.pricing.starter.cta}
              </Link>
            </div>

            <div className="relative rounded-3xl p-8 text-white" style={{ background: "#14120F" }}>
              <span className="absolute -top-3 left-8 rounded-full px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-white" style={{ background: "#6C4DFF" }}>
                {t.pricing.pro.badge}
              </span>
              <p className="text-[12.5px] font-mono uppercase tracking-[0.14em] text-white/60">{t.pricing.pro.name}</p>
              <p className="font-display mt-2 text-[2.1rem] font-bold tracking-tight">
                249€<span className="text-[14px] font-normal text-white/60">{t.pricing.pro.period}</span>
              </p>
              <p className="mt-2 text-[13px] text-white/70">{t.pricing.pro.detail}</p>
              <Link href={`/${params.locale}/dashboard`} className="mt-6 block rounded-full px-6 py-3 text-center text-[13.5px] font-semibold text-white" style={{ background: "#6C4DFF" }}>
                {t.pricing.pro.cta}
              </Link>
            </div>

            <div className="rounded-3xl border border-line bg-bg p-8">
              <p className="text-[12.5px] font-mono uppercase tracking-[0.14em] text-inkSoft">{t.pricing.enterprise.name}</p>
              <p className="font-display mt-2 text-[2.1rem] font-bold tracking-tight">{t.pricing.enterprise.price}</p>
              <p className="mt-2 text-[13px] text-inkSoft">{t.pricing.enterprise.detail}</p>
              <a href="mailto:contact@hostwai.com" className="mt-6 block rounded-full border border-line px-6 py-3 text-center text-[13.5px] font-medium text-ink hover:border-black/20">
                {t.pricing.enterprise.cta}
              </a>
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-lg text-center text-[12.5px] leading-relaxed text-inkSoft">{t.pricing.footnote}</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-display text-center text-[1.6rem] font-bold tracking-tight">{t.steps.title}</h2>
          <div className="mt-11 space-y-7">
            {t.steps.items.map((s, i) => (
              <div key={s.title} className="flex gap-5">
                <span className="font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13.5px] font-bold text-white" style={grad}>
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[15.5px] font-semibold">{s.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-inkSoft">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: "#14120F" }}>
        <div className="mx-auto max-w-2xl px-6 text-center">
          <MessageSquare className="mx-auto" style={{ color: "#6C4DFF" }} size={26} />
          <h2 className="font-display mt-4 text-[1.8rem] font-bold tracking-tight text-white">{t.ctaSection.title}</h2>
          <p className="mt-3 text-[13.5px] text-white/60">{t.ctaSection.text}</p>
          <Link href={`/${params.locale}/dashboard`} className="mt-7 inline-block rounded-full px-7 py-3.5 text-[14.5px] font-semibold text-white transition-opacity hover:opacity-90" style={{ ...grad, boxShadow: "0 10px 24px rgba(46,94,255,0.4)" }}>
            {t.ctaSection.cta}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center">
          <p className="text-[13px] text-inkSoft">{t.footer.tagline}</p>
        </div>
      </footer>
    </div>
  );
}
