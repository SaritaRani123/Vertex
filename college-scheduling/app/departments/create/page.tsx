import { redirect } from "next/navigation";
import { getSession } from "@/utils/auth";
import { DepartmentCreateForm } from "./DepartmentCreateForm";

export default async function DepartmentCreatePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create department</h1>
      <DepartmentCreateForm />
    </div>
  );
}
