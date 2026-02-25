import { redirect } from "next/navigation";
import { getSession } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { SubjectsClient } from "./SubjectsClient";
import type { Subject, Semester } from "@/types";

export default async function SubjectsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const [subjects, semesters] = await Promise.all([
    prisma.subject.findMany({
      include: { semester: { include: { program: { include: { department: true } } } } },
      orderBy: [{ semesterId: "asc" }, { code: "asc" }],
    }),
    prisma.semester.findMany({
      orderBy: [{ programId: "asc" }, { order: "asc" }],
    }),
  ]);
  const data: Subject[] = subjects.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    credits: s.credits,
    lectureHours: s.lectureHours,
    labHours: s.labHours,
    semesterId: s.semesterId,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
  const semesterLabels: Record<string, string> = {};
  for (const s of subjects) {
    const sem = s.semester;
    semesterLabels[s.semesterId] = `${sem.name} – ${sem.program.name} (${sem.program.department.name})`;
  }
  const semesterData: Semester[] = semesters.map((s) => ({
    id: s.id,
    name: s.name,
    order: s.order,
    programId: s.programId,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
  const semesterOptions = semesters.map((s) => ({
    value: s.id,
    label: semesterLabels[s.id] ?? s.name,
  }));
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Subjects</h1>
      <SubjectsClient
        initialData={data}
        semesterLabels={semesterLabels}
        semesters={semesterData}
        semesterOptions={semesterOptions}
      />
    </div>
  );
}
