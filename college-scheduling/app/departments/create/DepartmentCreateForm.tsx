"use client";

import { useRouter } from "next/navigation";
import { DepartmentForm } from "@/components/forms/DepartmentForm";

export function DepartmentCreateForm() {
  const router = useRouter();

  async function onSubmit(data: { name: string }) {
    const res = await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? "Failed to create");
    router.push("/departments");
    router.refresh();
  }

  return (
    <DepartmentForm
      onSubmit={onSubmit}
      onCancel={() => router.push("/departments")}
    />
  );
}
