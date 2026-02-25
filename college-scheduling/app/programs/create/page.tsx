import { redirect } from "next/navigation";
import { getSession } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { ProgramCreateForm } from "./ProgramCreateForm";
import type { Department } from "@/types";

export default async function ProgramCreatePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });
  const departmentData: Department[] = departments.map((d) => ({
    id: d.id,
    name: d.name,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create program</h1>
      <ProgramCreateForm departments={departmentData} />
    </div>
  );
}
