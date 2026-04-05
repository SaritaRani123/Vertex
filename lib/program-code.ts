import type { PrismaClient } from "@/generated/prisma/client";

/** Short uppercase code from program name (for auto-generated program codes). */
export function baseProgramCodeFromName(name: string): string {
  const compact = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .slice(0, 10)
    .toUpperCase();
  return compact.length >= 2 ? compact : "PRG";
}

export async function allocateUniqueProgramCode(
  prisma: PrismaClient,
  name: string
): Promise<string> {
  const base = baseProgramCodeFromName(name);
  let code = base;
  let n = 0;
  while (
    await prisma.programs.findUnique({
      where: { Code: code },
      select: { Id: true },
    })
  ) {
    n += 1;
    const suffix = String(n);
    code = `${base.slice(0, Math.max(1, 12 - suffix.length))}${suffix}`.slice(0, 12);
  }
  return code;
}
