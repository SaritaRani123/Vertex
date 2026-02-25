"use client";

import { useRouter } from "next/navigation";
import { ProgramForm } from "@/components/forms/ProgramForm";
import type { Department } from "@/types";

export function ProgramCreateForm({
  departments,
}: {
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
    const res = await fetch("/api/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? "Failed to create");
    router.push("/programs");
    router.refresh();
  }

  return (
    <ProgramForm
      departments={departments}
      onSubmit={onSubmit}
      onCancel={() => router.push("/programs")}
    />
  );
}
