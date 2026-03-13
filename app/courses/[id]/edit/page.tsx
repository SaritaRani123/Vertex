"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
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
  const [prerequisites, setPrerequisites] = useState("");
  const [credits, setCredits] = useState(0);
  const [lectureHours, setLectureHours] = useState(0);
  const [labHours, setLabHours] = useState(0);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "ARCHIVED">("ACTIVE");
  const [programId, setProgramId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setPrerequisites((data.prerequisites ?? []).join(", "));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!id || !programId) {
      setError("Missing ID or program");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim() || null,
          prerequisites: prerequisites
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
          credits,
          lecture_hours: lectureHours,
          lab_hours: labHours,
          status,
          program_id: Number(programId),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed to update course");
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

  if (error) {
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
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="code">Code</FieldLabel>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  className="uppercase"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="prerequisites">Prerequisites</FieldLabel>
                <Input
                  id="prerequisites"
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                  placeholder="CS101, MA101"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="credits">Credits</FieldLabel>
                <Input
                  id="credits"
                  type="number"
                  min={0}
                  value={credits}
                  onChange={(e) => setCredits(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="lectureHours">Lecture Hours</FieldLabel>
                <Input
                  id="lectureHours"
                  type="number"
                  min={0}
                  value={lectureHours}
                  onChange={(e) => setLectureHours(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="labHours">Lab Hours</FieldLabel>
                <Input
                  id="labHours"
                  type="number"
                  min={0}
                  value={labHours}
                  onChange={(e) => setLabHours(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel>Program</FieldLabel>
                <Select
                  value={programId}
                  onValueChange={(value) => {
                    if (value !== null) setProgramId(value);
                  }}
                  required
                  disabled={programsLoading}
                >
                  <SelectTrigger className="w-full">
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
