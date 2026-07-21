"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, Locale } from "@/lib/i18n";

const labels: Record<Locale, string> = { fr: "FR", en: "EN", es: "ES" };

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const rest = pathname.split("/").slice(2).join("/"); // strip current /xx prefix

  return (
    <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1">
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest ? `/${rest}` : ""}`}
          className="rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors"
          style={
            l === locale
              ? { background: "linear-gradient(135deg, #2E5EFF, #6C4DFF)", color: "#fff" }
              : { color: "#75726A" }
          }
        >
          {labels[l]}
        </Link>
      ))}
    </div>
  );
}
