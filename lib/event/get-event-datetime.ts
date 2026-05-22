/**
 * Reads NEXT_PUBLIC_EVENT_DATETIME (ISO-8601). Returns a Date when valid, null when
 * missing/invalid. The homepage countdown uses null to render `--` and hide the
 * "Coming soon" label per clarifications.md.
 */
export function getEventDatetime(): Date | null {
  const raw = process.env.NEXT_PUBLIC_EVENT_DATETIME?.trim();
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}
