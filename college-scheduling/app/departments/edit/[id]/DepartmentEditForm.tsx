"use client";

import { useRouter } from "next/navigation";
import { DepartmentForm } from "@/components/forms/DepartmentForm";
import type { Department } from "@/types";

export function DepartmentEditForm({
  id,
  initial,
}: {
  id: string;
  initial: Department;
}) {
  const router = useRouter();

  async function onSubmit(data: { name: string }) {
    const res = await fetch(`/api/departments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? "Failed to update");
    router.push("/departments");
    router.refresh();
  }

  return (
    <DepartmentForm
      initial={initial}
      onSubmit={onSubmit}
      onCancel={() => router.push("/departments")}
    />
  );
}
