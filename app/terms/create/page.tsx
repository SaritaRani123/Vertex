"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import type { SemesterResponse, CourseResponse } from "@/lib/api-types";

export default function CreateTermPage() {
  const router = useRouter();
  const [semesterYear, setSemesterYear] = useState<string>("");
  const [semesterType, setSemesterType] = useState<"FALL" | "WINTER" | "SUMMER" | "">("");
  const [courseId, setCourseId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [semesters, setSemesters] = useState<SemesterResponse[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [semRes, courseRes] = await Promise.all([fetch("/api/semesters"), fetch("/api/courses")]);
        if (!semRes.ok || !courseRes.ok) throw new Error("Failed to load selections");

        const semJson = await semRes.json();
        const courseJson = await courseRes.json();

        setSemesters(semJson.data ?? []);
        setCourses(courseJson.data ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getSemesterId = () => {
    if (!semesterYear || !semesterType) return null;
    const found = semesters.find(
      (s) => String(s.year) === semesterYear && s.type === semesterType,
    );
    return found?.id ?? null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const semesterId = getSemesterId();
    if (!semesterId || !courseId) {
      setError("Please select semester year, type and course");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semester_id: semesterId, course_id: Number(courseId) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed to create term");
        setIsSubmitting(false);
        return;
      }
      router.push("/terms");
    } catch {
      setError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/terms">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Term Assignment</h1>
          <p className="text-muted-foreground">Assign a course to a semester</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Term Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <FieldGroup>
              <Field>
                <FieldLabel>Semester Year</FieldLabel>
                <Select
                  value={semesterYear}
                  onValueChange={(value) => { if (value !== null) setSemesterYear(value); }}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {semesterYear || (loading ? "Loading…" : "Select year")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(semesters.map((s: SemesterResponse) => s.year)))
                      .sort((a, b) => a - b)
                      .map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Semester Type</FieldLabel>
                <Select
                  value={semesterType}
                  onValueChange={(value) => {
                    if (value === "FALL" || value === "WINTER" || value === "SUMMER") setSemesterType(value);
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {semesterType || (loading ? "Loading…" : "Select type")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(["FALL", "WINTER", "SUMMER"] as const).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Course</FieldLabel>
                <Select value={courseId} onValueChange={(value) => { if (value !== null) setCourseId(value); }} disabled={loading}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {courseId
                        ? `${courses.find((c) => String(c.id) === courseId)?.code ?? ""} - ${courses.find((c) => String(c.id) === courseId)?.name ?? ""}`
                        : loading
                        ? "Loading…"
                        : "Select course"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.code} - {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting ? "Assigning…" : "Assign Term"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/terms">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
