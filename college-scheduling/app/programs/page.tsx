import { redirect } from "next/navigation";
import { getSession } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { ProgramsClient } from "./ProgramsClient";
import type { Program } from "@/types";
import type { Department } from "@/types";

export default async function ProgramsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const [programs, departments] = await Promise.all([
    prisma.program.findMany({
      orderBy: [{ departmentId: "asc" }, { name: "asc" }],
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);
  const programData: Program[] = programs.map((p) => ({
    id: p.id,
    name: p.name,
    duration: p.duration,
    degreeType: p.degreeType,
    totalCredits: p.totalCredits,
    departmentId: p.departmentId,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
  const departmentData: Department[] = departments.map((d) => ({
    id: d.id,
    name: d.name,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));
  const deptMap = Object.fromEntries(departmentData.map((d) => [d.id, d.name]));
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Programs</h1>
      <ProgramsClient
        initialData={programData}
        departments={departmentData}
        departmentNames={deptMap}
      />
    </div>
  );
}
