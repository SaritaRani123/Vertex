"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { StaffCreateRouteGuard } from "@/components/staff-create-route-guard";
import { filterDigitsOnly, normalizeUnsignedIntString } from "@/lib/digits-input";

export default function CreateSemesterPage() {
  return (
    <StaffCreateRouteGuard backHref="/semesters">
      <CreateSemesterForm />
    </StaffCreateRouteGuard>
  );
}

function CreateSemesterForm() {
  const router = useRouter();
  const [yearStr, setYearStr] = useState(String(new Date().getFullYear()));
  const [semesterType, setSemesterType] = useState<"FALL" | "WINTER" | "SUMMER">("FALL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const errors: Record<string, string> = {};
    const year = yearStr.trim() === "" ? NaN : parseInt(yearStr, 10);
    if (Number.isNaN(year)) errors.year = "Enter a year";
    else if (year < 1900 || year > 3000) errors.year = "Year must be between 1900 and 3000";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the errors below.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, type: semesterType }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed to create semester");
        const details = data?.details as Array<{ path: (string | number)[]; message: string }> | undefined;
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
      router.push("/semesters");
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
          <Link href="/semesters">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Semester</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semester Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <FieldGroup>
              <Field data-invalid={!!fieldErrors.year}>
                <FieldLabel htmlFor="year">Year</FieldLabel>
                <Input
                  id="year"
                  inputMode="numeric"
                  min={1900}
                  max={3000}
                  value={yearStr}
                  onChange={(e) => {
                    setYearStr(filterDigitsOnly(e.target.value));
                    setFieldErrors((p) => ({ ...p, year: "" }));
                  }}
                  onBlur={() => setYearStr((s) => normalizeUnsignedIntString(s))}
                  required
                  aria-invalid={!!fieldErrors.year}
                />
                {fieldErrors.year && <FieldError>{fieldErrors.year}</FieldError>}
              </Field>
              <Field data-invalid={!!fieldErrors.type}>
                <FieldLabel>Type</FieldLabel>
                <Select value={semesterType} onValueChange={(value) => {
                  if (value === "FALL" || value === "WINTER" || value === "SUMMER") {
                    setSemesterType(value);
                    setFieldErrors((p) => ({ ...p, type: "" }));
                  }
                }}>
                  <SelectTrigger className="w-full" aria-invalid={!!fieldErrors.type}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FALL">Fall</SelectItem>
                    <SelectItem value="WINTER">Winter</SelectItem>
                    <SelectItem value="SUMMER">Summer</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.type && <FieldError>{fieldErrors.type}</FieldError>}
              </Field>
            </FieldGroup>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Semester"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/semesters">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
