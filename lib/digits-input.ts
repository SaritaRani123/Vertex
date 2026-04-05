/** Allow only digits; empty string is OK while editing (avoids parseInt(...) || 0 snapping back to 0). */
export function filterDigitsOnly(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

/** Collapse leading zeros (e.g. "02" → "2"); empty stays empty. */
export function normalizeUnsignedIntString(s: string): string {
  if (s === "") return "";
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? "" : String(n);
}
