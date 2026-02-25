import { redirect } from "next/navigation";
import { getSession } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { SemestersClient } from "./SemestersClient";
import type { Semester } from "@/types";

export default async function SemestersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const [semesters, programsWithDept] = await Promise.all([
    prisma.semester.findMany({
      orderBy: [{ programId: "asc" }, { order: "asc" }],
    }),
    prisma.program.findMany({
      include: { department: true },
      orderBy: [{ departmentId: "asc" }, { name: "asc" }],
    }),
  ]);
  const semesterData: Semester[] = semesters.map((s) => ({
    id: s.id,
    name: s.name,
    order: s.order,
    programId: s.programId,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
  const programNames: Record<string, string> = {};
  for (const p of programsWithDept) {
    programNames[p.id] = `${p.name} (${p.department.name})`;
  }
  const programOptions = programsWithDept.map((p) => ({
    value: p.id,
    label: programNames[p.id],
  }));
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Semesters</h1>
      <SemestersClient
        initialData={semesterData}
        programNames={programNames}
        programOptions={programOptions}
      />
    </div>
  );
}
