/** Shared Prisma include for course API responses (semester sequence + elective pool labels). */
export const courseApiInclude = {
  Program: { select: { Name: true } },
  ProgramSemester: { select: { Sequence: true } },
  ElectiveGroup: { select: { Id: true, Label: true, ChooseCount: true } },
} as const;
