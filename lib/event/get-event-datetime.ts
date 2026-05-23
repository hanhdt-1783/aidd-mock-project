import { createClient } from "@/lib/supabase/server";

/**
 * Resolves the canonical event start datetime. DB-first with env fallback.
 *
 * Source order:
 *   1. Supabase `event_config.event_datetime` (singleton row).
 *   2. `NEXT_PUBLIC_EVENT_DATETIME` (ISO-8601) — fallback when DB is empty or query errors.
 *
 * Returns `null` when neither source yields a valid Date. Callers render `--` for null.
 */
export async function getEventDatetime(): Promise<Date | null> {
  // Try DB first.
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("event_config")
      .select("event_datetime")
      .limit(1)
      .maybeSingle();

    if (!error && data?.event_datetime) {
      const parsed = new Date(data.event_datetime);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  } catch {
    // Swallow — fall through to env fallback. Common during build or when
    // Supabase env vars are absent.
  }

  // Env fallback.
  const raw = process.env.NEXT_PUBLIC_EVENT_DATETIME?.trim();
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}
