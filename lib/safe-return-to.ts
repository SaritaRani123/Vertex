/** Allow in-app relative paths only (for ?returnTo=). */
export function safeReturnTo(raw: string | null | undefined): string | null {
  if (raw == null || raw === "") return null;
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return null;
  if (t.includes("://")) return null;
  return t;
}
