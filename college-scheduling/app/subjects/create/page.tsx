import { redirect } from "next/navigation";
import { getSession } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { SubjectCreateForm } from "./SubjectCreateForm";
import type { Semester } from "@/types";

export default async function SubjectCreatePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const semesters = await prisma.semester.findMany({
    orderBy: [{ programId: "asc" }, { order: "asc" }],
  });
  const semesterData: Semester[] = semesters.map((s) => ({
    id: s.id,
    name: s.name,
    order: s.order,
    programId: s.programId,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create subject</h1>
      <SubjectCreateForm semesters={semesterData} />
    </div>
  );
}
