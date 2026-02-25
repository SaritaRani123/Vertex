"use client";

import { useRouter } from "next/navigation";
import { SubjectForm } from "@/components/forms/SubjectForm";
import type { Subject, Semester } from "@/types";

export function SubjectEditForm({
  id,
  initial,
  semesters,
}: {
  id: string;
  initial: Subject;
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
    const res = await fetch(`/api/subjects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? "Failed to update");
    router.push("/subjects");
    router.refresh();
  }

  return (
    <SubjectForm
      semesters={semesters}
      initial={initial}
      onSubmit={onSubmit}
      onCancel={() => router.push("/subjects")}
    />
  );
}
