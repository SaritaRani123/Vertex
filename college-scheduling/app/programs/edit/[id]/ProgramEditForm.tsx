"use client";

import { useRouter } from "next/navigation";
import { ProgramForm } from "@/components/forms/ProgramForm";
import type { Program, Department } from "@/types";

export function ProgramEditForm({
  id,
  initial,
  departments,
}: {
  id: string;
  initial: Program;
  departments: Department[];
}) {
  const router = useRouter();

  async function onSubmit(data: {
    name: string;
    duration: number;
    degreeType: string;
    totalCredits: number;
    departmentId: string;
  }) {
    const res = await fetch(`/api/programs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? "Failed to update");
    router.push("/programs");
    router.refresh();
  }

  return (
    <ProgramForm
      departments={departments}
      initial={initial}
      onSubmit={onSubmit}
      onCancel={() => router.push("/programs")}
    />
  );
}
