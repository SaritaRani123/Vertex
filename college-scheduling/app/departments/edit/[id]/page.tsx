import { redirect, notFound } from "next/navigation";
import { getSession } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { DepartmentEditForm } from "./DepartmentEditForm";

export default async function DepartmentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;
  const d = await prisma.department.findUnique({ where: { id } });
  if (!d) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit department</h1>
      <DepartmentEditForm
        id={id}
        initial={{
          id: d.id,
          name: d.name,
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString(),
        }}
      />
    </div>
  );
}
