import type { PrismaClient } from "@/generated/prisma/client";

/**
 * Ensures rows exist for curriculum semesters 1…(duration_years × 2).
 * Fixes programs that have no `program_semesters` rows (e.g. legacy data) so the UI can show empty semesters like newly created programs.
 */
export async function ensureProgramSemestersForDuration(
  prisma: PrismaClient,
  programId: number,
  durationYears: number
): Promise<void> {
  const expected = Math.max(0, durationYears * 2);
  if (expected < 1) return;

  await prisma.$transaction(async (tx) => {
    const existing = await tx.programSemesters.findMany({
      where: { ProgramId: programId },
      select: { Sequence: true },
    });
    const have = new Set(existing.map((e) => e.Sequence));
    for (let seq = 1; seq <= expected; seq++) {
      if (!have.has(seq)) {
        await tx.programSemesters.create({
          data: { ProgramId: programId, Sequence: seq },
        });
      }
    }
  });
}
