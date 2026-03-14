"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldGroup, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import type { CourseResponse, ProgramResponse } from "@/lib/api-types";
import type { CourseOption } from "@/components/course-multi-select";
import { CourseMultiSelect } from "@/components/course-multi-select";

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [programs, setPrograms] = useState<ProgramResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [prerequisiteIds, setPrerequisiteIds] = useState<number[]>([]);
  const [credits, setCredits] = useState(0);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const hasInitializedPrereqs = useRef(false);
  const [lectureHours, setLectureHours] = useState(0);
  const [labHours, setLabHours] = useState(0);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "ARCHIVED">("ACTIVE");
  const [programId, setProgramId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      try {
        if (!id) throw new Error("Course id missing");
        const res = await fetch(`/api/courses/${id}`);
        if (!res.ok) throw new Error("Failed to load course");
        const data = await res.json();
        setCourse(data);
        setName(data.name);
        setCode(data.code);
        setDescription(data.description ?? "");
        setCredits(data.credits);
        setLectureHours(data.lecture_hours);
        setLabHours(data.lab_hours);
        setStatus(data.status);
        setProgramId(String(data.program_id));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load course");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  useEffect(() => {
    async function loadPrograms() {
      try {
        const res = await fetch("/api/programs");
        if (!res.ok) return;
        const json = await res.json();
        setPrograms(json.data ?? []);
      } finally {
        setProgramsLoading(false);
      }
    }

    loadPrograms();
  }, []);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses");
        if (!res.ok) return;
        const json = await res.json();
        const data = json.data ?? [];
        setCourses(
          data.map((c: { id: number; name: string; code: string; description?: string | null; credits?: number; lecture_hours?: number; lab_hours?: number; status?: string; program_name?: string }) => ({
            id: c.id,
            name: c.name,
            code: c.code,
            description: c.description ?? undefined,
            credits: c.credits,
            lecture_hours: c.lecture_hours,
            lab_hours: c.lab_hours,
            status: c.status,
            program_name: c.program_name,
          }))
        );
      } catch {
        // ignore
      }
    }
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!course || courses.length === 0 || hasInitializedPrereqs.current) return;
    hasInitializedPrereqs.current = true;
    const ids = (course.prerequisites ?? [])
      .map((codeStr) => courses.find((c) => c.code === codeStr)?.id)
      .filter((id): id is number => id != null);
    setPrerequisiteIds(ids);
  }, [course, courses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    if (!id) return;
    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();
    const errors: Record<string, string> = {};
    if (!trimmedName) errors.name = "Name is required";
    if (!trimmedCode) errors.code = "Code is required";
    if (credits < 0) errors.credits = "Credits must be 0 or more";
    if (lectureHours < 0) errors.lecture_hours = "Lecture hours must be 0 or more";
    if (labHours < 0) errors.lab_hours = "Lab hours must be 0 or more";
    if (!programId) errors.program_id = "Please select a program";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the errors below.");
      return;
    }
    setIsSubmitting(true);
    try {
      const prerequisiteCodes = prerequisiteIds
        .map((id) => courses.find((c) => c.id === id)?.code)
        .filter((c): c is string => Boolean(c));

      const res = await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          code: trimmedCode,
          description: description.trim() || null,
          prerequisites: prerequisiteCodes,
          credits,
          lecture_hours: lectureHours,
          lab_hours: labHours,
          status,
          program_id: Number(programId),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error ?? "Failed to update course";
        const details = data?.details as Array<{ path: (string | number)[]; message: string }> | undefined;
        setError(details?.length ? `${msg} ${details.map((d) => d.message).join(". ")}` : msg);
        if (details?.length) {
          const byField: Record<string, string> = {};
          for (const d of details) {
            const key = String(d.path[0] ?? "");
            if (key && !byField[key]) byField[key] = d.message;
          }
          setFieldErrors(byField);
        }
        setIsSubmitting(false);
        return;
      }
      router.push("/courses");
    } catch {
      setError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading course…</p>;
  }

  if (error && !course) {
    return <p className="text-destructive">{error}</p>;
  }

  if (!course) {
    return <p className="text-muted-foreground">Course not found.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/courses">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Course</h1>
          <p className="text-muted-foreground">Update course details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Course</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <FieldGroup>
              <Field data-invalid={!!fieldErrors.name}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: "" })); }}
                  required
                  aria-invalid={!!fieldErrors.name}
                />
                {fieldErrors.name && <FieldError>{fieldErrors.name}</FieldError>}
              </Field>
              <Field data-invalid={!!fieldErrors.code}>
                <FieldLabel htmlFor="code">Code</FieldLabel>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setFieldErrors((p) => ({ ...p, code: "" })); }}
                  required
                  className="uppercase"
                  aria-invalid={!!fieldErrors.code}
                />
                {fieldErrors.code && <FieldError>{fieldErrors.code}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="prerequisites">Prerequisites</FieldLabel>
                <CourseMultiSelect
                  selectedCourses={prerequisiteIds}
                  onChange={(ids) => setPrerequisiteIds(ids)}
                  courses={courses}
                  excludeCourseId={course.id}
                />
              </Field>
              <Field data-invalid={!!fieldErrors.credits}>
                <FieldLabel htmlFor="credits">Credits</FieldLabel>
                <Input
                  id="credits"
                  type="number"
                  min={0}
                  value={credits}
                  onChange={(e) => { setCredits(parseInt(e.target.value, 10) || 0); setFieldErrors((p) => ({ ...p, credits: "" })); }}
                  required
                  aria-invalid={!!fieldErrors.credits}
                />
                {fieldErrors.credits && <FieldError>{fieldErrors.credits}</FieldError>}
              </Field>
              <Field data-invalid={!!fieldErrors.lecture_hours}>
                <FieldLabel htmlFor="lectureHours">Lecture Hours</FieldLabel>
                <Input
                  id="lectureHours"
                  type="number"
                  min={0}
                  value={lectureHours}
                  onChange={(e) => { setLectureHours(parseInt(e.target.value, 10) || 0); setFieldErrors((p) => ({ ...p, lecture_hours: "" })); }}
                  required
                  aria-invalid={!!fieldErrors.lecture_hours}
                />
                {fieldErrors.lecture_hours && <FieldError>{fieldErrors.lecture_hours}</FieldError>}
              </Field>
              <Field data-invalid={!!fieldErrors.lab_hours}>
                <FieldLabel htmlFor="labHours">Lab Hours</FieldLabel>
                <Input
                  id="labHours"
                  type="number"
                  min={0}
                  value={labHours}
                  onChange={(e) => { setLabHours(parseInt(e.target.value, 10) || 0); setFieldErrors((p) => ({ ...p, lab_hours: "" })); }}
                  required
                  aria-invalid={!!fieldErrors.lab_hours}
                />
                {fieldErrors.lab_hours && <FieldError>{fieldErrors.lab_hours}</FieldError>}
              </Field>
              <Field data-invalid={!!fieldErrors.program_id}>
                <FieldLabel>Program</FieldLabel>
                <Select
                  value={programId}
                  onValueChange={(value) => {
                    if (value !== null) setProgramId(value);
                    setFieldErrors((p) => ({ ...p, program_id: "" }));
                  }}
                  required
                  disabled={programsLoading}
                >
                  <SelectTrigger className="w-full" aria-invalid={!!fieldErrors.program_id}>
                    <SelectValue placeholder={programsLoading ? "Loading…" : "Select program"}>
                      {programId && !programsLoading
                        ? programs.find((p) => String(p.id) === programId)?.name
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name} ({p.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.program_id && <FieldError>{fieldErrors.program_id}</FieldError>}
              </Field>
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Select value={status} onValueChange={(v) => {
                  if (v === "ACTIVE" || v === "INACTIVE" || v === "ARCHIVED") setStatus(v);
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting || programsLoading}>
                {isSubmitting ? "Updating…" : "Update Course"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/courses">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
