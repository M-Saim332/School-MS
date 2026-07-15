import { readPublicSupabaseEnv } from "@/lib/supabase/env";

const LOCAL_SUPABASE_HOSTS = new Set(["127.0.0.1", "localhost"]);

function getSupabaseUrl() {
  const env = readPublicSupabaseEnv();
  if (!env) return null;

  try {
    return new URL(env.url);
  } catch {
    return null;
  }
}

export function getSupabaseBrowserErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    if (error.message === "Failed to fetch") {
      const supabaseUrl = getSupabaseUrl();
      if (supabaseUrl && LOCAL_SUPABASE_HOSTS.has(supabaseUrl.hostname)) {
        return "Unable to reach the local Supabase server. Start Docker Desktop and run `npm run dev:local`, or point `.env.local` to a reachable Supabase project.";
      }

      return "Unable to reach the authentication service right now. Please try again in a moment.";
    }

    if (error.message) return error.message;
  }

  return fallbackMessage;
}
