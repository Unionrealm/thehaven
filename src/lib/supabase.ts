import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // Return a stub so client components don't crash when env vars are unset
    // (e.g. initial Vercel deploy without Supabase configured).
    // Realtime subscriptions will simply be no-ops until env is set.
    client = createClient("https://placeholder.supabase.co", "placeholder-anon-key");
    return client;
  }
  client = createClient(url, anonKey);
  return client;
}

// Proxy so `supabase.channel(...)` still works without eager construction.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const c = getClient() as unknown as Record<string | symbol, unknown>;
    const value = c[prop];
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(c) : value;
  },
});
