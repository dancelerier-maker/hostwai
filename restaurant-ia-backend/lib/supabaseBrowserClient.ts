import { createBrowserClient } from "@supabase/ssr";

// Client "anon" utilisé UNIQUEMENT côté navigateur, uniquement pour les
// appels d'authentification (signUp, signInWithPassword, signInWithOAuth).
// Il ne sert jamais à lire/écrire les données (réservations, réglages...) —
// ça reste géré côté serveur avec la clé service_role, comme avant.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
