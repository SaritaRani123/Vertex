import { redirect, notFound } from "next/navigation";
import { getSession } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { SubjectEditForm } from "./SubjectEditForm";
import type { Subject } from "@/types";
import type { Semester } from "@/types";

export default async function SubjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;
  const [subject, semesters] = await Promise.all([
    prisma.subject.findUnique({ where: { id } }),
    prisma.semester.findMany({
      orderBy: [{ programId: "asc" }, { order: "asc" }],
    }),
  ]);
  if (!subject) notFound();
  const semesterData: Semester[] = semesters.map((s) => ({
    id: s.id,
    name: s.name,
    order: s.order,
    programId: s.programId,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
  const initial: Subject = {
    id: subject.id,
    code: subject.code,
    name: subject.name,
    credits: subject.credits,
    lectureHours: subject.lectureHours,
    labHours: subject.labHours,
    semesterId: subject.semesterId,
    createdAt: subject.createdAt.toISOString(),
    updatedAt: subject.updatedAt.toISOString(),
  };
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit subject</h1>
      <SubjectEditForm id={id} initial={initial} semesters={semesterData} />
    </div>
  );
}
