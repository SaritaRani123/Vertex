"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import type { DepartmentResponse, ProgramResponse } from "@/lib/api-types";

export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [durationYears, setDurationYears] = useState(4);
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [program, setProgram] = useState<ProgramResponse | null>(null);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch("/api/departments");
        if (!res.ok) return;
        const json = await res.json();
        setDepartments(json.data ?? []);
      } catch {
        // ignore
      }
    }
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (!id) return;
    async function fetchProgram() {
      try {
        const res = await fetch(`/api/programs/${id}`);
        if (!res.ok) {
          if (res.status === 404) setError("Program not found");
          else setError("Failed to load program");
          return;
        }
        const data: ProgramResponse = await res.json();
        setProgram(data);
        setName(data.name ?? "");
        setCode(data.code ?? "");
        setDurationYears(data.duration_years ?? 4);
        setDepartmentId(String(data.department_id));
        setStatus((data.status as "ACTIVE" | "INACTIVE") ?? "ACTIVE");
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchProgram();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !departmentId) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/programs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          duration_years: durationYears,
          status,
          department_id: Number(departmentId),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed to update program");
        return;
      }
      router.push("/programs");
    } catch {
      setError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !program) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (error && !program) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" asChild>
          <Link href="/programs">Back to Programs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/programs">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Program</h1>
          <p className="text-muted-foreground">
            Update program details
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="code">Code</FieldLabel>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. BTCS"
                  required
                  className="uppercase"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="duration">Duration (years)</FieldLabel>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  max={6}
                  value={durationYears}
                  onChange={(e) => setDurationYears(parseInt(e.target.value, 10) || 4)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel>Department</FieldLabel>
                <Select value={departmentId} onValueChange={setDepartmentId} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={String(dept.id)}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Select value={status} onValueChange={(v: "ACTIVE" | "INACTIVE") => setStatus(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/programs">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
