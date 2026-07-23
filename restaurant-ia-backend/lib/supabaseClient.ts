import { createClient } from "@supabase/supabase-js";

// Server-only client (service role key = accès complet, RLS ignorée).
// Ne jamais importer ce fichier depuis du code exécuté côté navigateur.
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    "Supabase non configuré : SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY manquants."
  );
}

// Placeholder valide uniquement pour ne pas faire planter le build/l'import
// quand les variables d'env sont absentes (ex: build local). Toute requête
// réelle échouera clairement tant que SUPABASE_URL n'est pas configuré.
export const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseServiceRoleKey || "placeholder", {
  auth: { persistSession: false },
});

// Mono-tenant pour ce sprint : un seul restaurant, id fixe (voir supabase/schema.sql).
// Quand il y aura plusieurs restaurants, ce sera remplacé par un lookup sur
// le numéro Twilio appelé ("To" du webhook) — pas avant.
export const DEFAULT_RESTAURANT_ID =
  process.env.DEFAULT_RESTAURANT_ID || "00000000-0000-0000-0000-000000000001";
