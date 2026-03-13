"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import type { ProgramResponse } from "@/lib/api-types";

export default function CreateCoursePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  const [credits, setCredits] = useState(3);
  const [lectureHours, setLectureHours] = useState(2);
  const [labHours, setLabHours] = useState(0);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "ARCHIVED">("ACTIVE");
  const [programId, setProgramId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [programs, setPrograms] = useState<ProgramResponse[]>([]);
  const [programsLoading, setProgramsLoading] = useState(true);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const res = await fetch("/api/programs");
        if (!res.ok) return;
        const json = await res.json();
        setPrograms(json.data ?? []);
      } finally {
        setProgramsLoading(false);
      }
    }
    fetchPrograms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!programId) {
      setError("Please select a program");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
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
        setError(data?.error ?? "Failed to create course");
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/courses">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Course</h1>
          <p className="text-muted-foreground">Add a new course to a program</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Data Structures"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="code">Code</FieldLabel>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CS201"
                  required
                  className="uppercase"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="prerequisites">Prerequisites</FieldLabel>
                <Input
                  id="prerequisites"
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                  placeholder="Comma-separated, e.g. CS101, MA101"
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
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting || programsLoading}>
                {isSubmitting ? "Creating…" : "Create Course"}
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
