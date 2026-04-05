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
  FieldError,
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
import { filterDigitsOnly, normalizeUnsignedIntString } from "@/lib/digits-input";

export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [durationYearsStr, setDurationYearsStr] = useState("4");
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
        setDurationYearsStr(String(data.duration_years ?? 4));
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
    if (!id) return;
    setError(null);
    setFieldErrors({});
    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();
    const errors: Record<string, string> = {};
    if (!trimmedName) errors.name = "Name is required";
    if (!trimmedCode) errors.code = "Code is required";
    const durationYears =
      durationYearsStr.trim() === "" ? NaN : parseInt(durationYearsStr, 10);
    if (Number.isNaN(durationYears)) errors.duration_years = "Enter duration in years";
    else if (durationYears < 1) errors.duration_years = "Duration must be at least 1 year";
    if (!departmentId) errors.department_id = "Please select a department";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the errors below.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/programs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          code: trimmedCode,
          duration_years: durationYears,
          status,
          department_id: Number(departmentId),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed to update program");
        const details = data?.details as Array<{ path: (string | number)[]; message: string }> | undefined;
        if (details?.length) {
          const byField: Record<string, string> = {};
          for (const d of details) {
            const key = String(d.path[0] ?? "");
            if (key && !byField[key]) byField[key] = d.message;
          }
          setFieldErrors(byField);
        }
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
        <p className="text-muted-foreground">Loading...</p>
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
              <Field data-invalid={!!fieldErrors.name}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: "" })); }}
                  placeholder="e.g. B.Tech Computer Science"
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
                  placeholder="e.g. BTCS"
                  required
                  className="uppercase"
                  aria-invalid={!!fieldErrors.code}
                />
                {fieldErrors.code && <FieldError>{fieldErrors.code}</FieldError>}
              </Field>
              <Field data-invalid={!!fieldErrors.duration_years}>
                <FieldLabel htmlFor="duration">Duration (years)</FieldLabel>
                <Input
                  id="duration"
                  inputMode="numeric"
                  min={1}
                  max={6}
                  value={durationYearsStr}
                  onChange={(e) => {
                    setDurationYearsStr(filterDigitsOnly(e.target.value));
                    setFieldErrors((p) => ({ ...p, duration_years: "" }));
                  }}
                  onBlur={() => setDurationYearsStr((s) => normalizeUnsignedIntString(s))}
                  required
                  aria-invalid={!!fieldErrors.duration_years}
                />
                {fieldErrors.duration_years && <FieldError>{fieldErrors.duration_years}</FieldError>}
              </Field>
              <Field data-invalid={!!fieldErrors.department_id}>
                <FieldLabel>Department</FieldLabel>
                <Select value={departmentId} onValueChange={(value) => {
                  if (value !== null) setDepartmentId(value);
                  setFieldErrors((p) => ({ ...p, department_id: "" }));
                }} required>
                  <SelectTrigger className="w-full" aria-invalid={!!fieldErrors.department_id}>
                    <SelectValue placeholder="Select department">
                      {departmentId ? (
                        departments.find((d) => String(d.id) === departmentId) ? (
                          <>{departments.find((d) => String(d.id) === departmentId)?.name}</>
                        ) : (
                          "Select department"
                        )
                      ) : (
                        "Select department"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={String(dept.id)}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.department_id && <FieldError>{fieldErrors.department_id}</FieldError>}
              </Field>
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Select value={status} onValueChange={(v) => {
                  if (v === "ACTIVE" || v === "INACTIVE") setStatus(v);
                }}>
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
                {isSubmitting ? "Saving..." : "Save changes"}
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
