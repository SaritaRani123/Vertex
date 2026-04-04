"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldGroup, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import type { SemesterResponse, CourseResponse } from "@/lib/api-types";
import { StaffCreateRouteGuard } from "@/components/staff-create-route-guard";

export default function CreateTermPage() {
  return (
    <StaffCreateRouteGuard backHref="/terms">
      <CreateTermForm />
    </StaffCreateRouteGuard>
  );
}

function CreateTermForm() {
  const router = useRouter();
  const [semesterYear, setSemesterYear] = useState<string>("");
  const [semesterType, setSemesterType] = useState<"FALL" | "WINTER" | "SUMMER" | "">("");
  const [courseId, setCourseId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
    setFieldErrors({});
    const semesterId = getSemesterId();
    const errors: Record<string, string> = {};
    if (!semesterYear) errors.semester_year = "Please select a semester year";
    else if (!semesterType) errors.semester_type = "Please select a semester type";
    else if (!semesterId)
      errors.semester_type =
        "No semester exists for the selected year and type. Add it in Semesters first.";
    if (!courseId) errors.course_id = "Please select a course";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the errors below.");
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
        const details = data?.details as Array<{ path: (string | number)[]; message: string }> | undefined;
        if (details?.length) {
          const byField: Record<string, string> = {};
          for (const d of details) {
            const key = String(d.path[0] ?? "");
            if (key && !byField[key]) byField[key] = d.message;
            if (key === "semester_id") {
              byField.semester_year = byField.semester_year ?? d.message;
              byField.semester_type = byField.semester_type ?? d.message;
            }
          }
          setFieldErrors(byField);
        }
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
              <Field data-invalid={!!fieldErrors.semester_year}>
                <FieldLabel>Semester Year</FieldLabel>
                <Select
                  value={semesterYear}
                  onValueChange={(value) => {
                    if (value !== null) setSemesterYear(value);
                    setFieldErrors((p) => ({ ...p, semester_year: "", semester_type: "" }));
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full" aria-invalid={!!fieldErrors.semester_year}>
                    <SelectValue>
                      {semesterYear || (loading ? "Loading..." : "Select year")}
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
                {fieldErrors.semester_year && <FieldError>{fieldErrors.semester_year}</FieldError>}
              </Field>
              <Field data-invalid={!!fieldErrors.semester_type}>
                <FieldLabel>Semester Type</FieldLabel>
                <Select
                  value={semesterType}
                  onValueChange={(value) => {
                    if (value === "FALL" || value === "WINTER" || value === "SUMMER") setSemesterType(value);
                    setFieldErrors((p) => ({ ...p, semester_year: "", semester_type: "" }));
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full" aria-invalid={!!fieldErrors.semester_type}>
                    <SelectValue>
                      {semesterType || (loading ? "Loading..." : "Select type")}
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
                {fieldErrors.semester_type && <FieldError>{fieldErrors.semester_type}</FieldError>}
              </Field>
              <Field data-invalid={!!fieldErrors.course_id}>
                <FieldLabel>Course</FieldLabel>
                <Select
                  value={courseId}
                  onValueChange={(value) => {
                    if (value !== null) setCourseId(value);
                    setFieldErrors((p) => ({ ...p, course_id: "" }));
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full" aria-invalid={!!fieldErrors.course_id}>
                    <SelectValue>
                      {courseId
                        ? `${courses.find((c) => String(c.id) === courseId)?.code ?? ""} - ${courses.find((c) => String(c.id) === courseId)?.name ?? ""}`
                        : loading
                        ? "Loading..."
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
                {fieldErrors.course_id && <FieldError>{fieldErrors.course_id}</FieldError>}
              </Field>
            </FieldGroup>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting ? "Assigning..." : "Assign Term"}
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
