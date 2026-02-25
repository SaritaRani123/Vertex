"use client";

import { useRouter } from "next/navigation";
import { SubjectForm } from "@/components/forms/SubjectForm";
import type { Semester } from "@/types";

export function SubjectCreateForm({
  semesters,
}: {
  semesters: Semester[];
}) {
  const router = useRouter();

  async function onSubmit(data: {
    code: string;
    name: string;
    credits: number;
    lectureHours: number;
    labHours: number;
    semesterId: string;
  }) {
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? "Failed to create");
    router.push("/subjects");
    router.refresh();
  }

  return (
    <SubjectForm
      semesters={semesters}
      onSubmit={onSubmit}
      onCancel={() => router.push("/subjects")}
    />
  );
}
