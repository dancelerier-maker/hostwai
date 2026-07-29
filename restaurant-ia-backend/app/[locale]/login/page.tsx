"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

const grad = { background: "linear-gradient(135deg, #2E5EFF, #6C4DFF)" };

export default function LoginPage({ params }: { params: { locale: string } }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (loginError) {
      setError(loginError.message);
      return;
    }
    window.location.href = `/${params.locale}/dashboard`;
  }

  async function handleGoogleLogin() {
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback?next=/${params.locale}/dashboard` },
    });
    if (oauthError) setError(oauthError.message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#FAFAF8" }}>
      <div className="w-full max-w-sm rounded-3xl border p-8" style={{ borderColor: "#EBEAE5", background: "#FFFFFF" }}>
        <h1 className="text-[22px] font-bold tracking-tight" style={{ color: "#14120F" }}>Se connecter</h1>

        <button
          onClick={handleGoogleLogin}
          className="mt-6 w-full rounded-full border px-5 py-3 text-[14px] font-medium"
          style={{ borderColor: "#EBEAE5", color: "#14120F" }}
        >
          Continuer avec Google
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "#EBEAE5" }} />
          <span className="text-[12px]" style={{ color: "#75726A" }}>ou</span>
          <div className="h-px flex-1" style={{ background: "#EBEAE5" }} />
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-full border px-4 py-3 text-[14px]"
            style={{ borderColor: "#EBEAE5" }}
          />
          <input
            type="password"
            required
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-full border px-4 py-3 text-[14px]"
            style={{ borderColor: "#EBEAE5" }}
          />
          {error && <p className="text-[12.5px]" style={{ color: "#B3261E" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full px-5 py-3 text-[14px] font-semibold text-white disabled:opacity-50"
            style={grad}
          >
            {loading ? "..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px]" style={{ color: "#75726A" }}>
          Pas encore de compte ? <a href={`/${params.locale}/signup`} className="font-medium" style={{ color: "#2E5EFF" }}>Créer un compte</a>
        </p>
      </div>
    </div>
  );
}
