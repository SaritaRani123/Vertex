import { redirect, notFound } from "next/navigation";
import { getSession } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { ProgramEditForm } from "./ProgramEditForm";
import type { Program } from "@/types";
import type { Department } from "@/types";

export default async function ProgramEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;
  const [p, departments] = await Promise.all([
    prisma.program.findUnique({ where: { id } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!p) notFound();
  const departmentData: Department[] = departments.map((d) => ({
    id: d.id,
    name: d.name,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));
  const initial: Program = {
    id: p.id,
    name: p.name,
    duration: p.duration,
    degreeType: p.degreeType,
    totalCredits: p.totalCredits,
    departmentId: p.departmentId,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit program</h1>
      <ProgramEditForm id={id} initial={initial} departments={departmentData} />
    </div>
  );
}
