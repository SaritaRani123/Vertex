import { redirect } from "next/navigation";
import { getSession } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { PrerequisitesClient } from "./PrerequisitesClient";
import type { Prerequisite } from "@/types";
import type { Subject } from "@/types";

export default async function PrerequisitesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const prereqs = await prisma.prerequisite.findMany({
    include: {
      subject: { include: { semester: { include: { program: true } } } },
      dependsOn: true,
    },
    orderBy: [{ subjectId: "asc" }, { dependsOnId: "asc" }],
  });
  const data: Prerequisite[] = prereqs.map((p) => ({
    id: p.id,
    subjectId: p.subjectId,
    dependsOnId: p.dependsOnId,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
  const subjects = await prisma.subject.findMany({
    orderBy: [{ code: "asc" }],
  });
  const subjectLabels: Record<string, string> = {};
  for (const s of subjects) {
    subjectLabels[s.id] = `${s.code} – ${s.name}`;
  }
  const subjectList: Subject[] = subjects.map((s) => ({
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
  const subjectOptions = subjects.map((s) => ({
    value: s.id,
    label: subjectLabels[s.id],
  }));
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Prerequisites</h1>
      <PrerequisitesClient
        initialData={data}
        subjectLabels={subjectLabels}
        subjects={subjectList}
        subjectOptions={subjectOptions}
      />
    </div>
  );
}
