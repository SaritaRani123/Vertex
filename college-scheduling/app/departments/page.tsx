import { redirect } from "next/navigation";
import { getSession } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { DepartmentsClient } from "./DepartmentsClient";
import type { Department } from "@/types";

export default async function DepartmentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const list = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });
  const data: Department[] = list.map((d) => ({
    id: d.id,
    name: d.name,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Departments</h1>
      <DepartmentsClient initialData={data} />
    </div>
  );
}
