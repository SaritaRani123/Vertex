"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft } from "lucide-react";
import { StaffCreateRouteGuard } from "@/components/staff-create-route-guard";

export default function CreateDepartmentPage() {
  return (
    <StaffCreateRouteGuard backHref="/departments">
      <CreateDepartmentForm />
    </StaffCreateRouteGuard>
  );
}

function CreateDepartmentForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();
    const errors: Record<string, string> = {};
    if (!trimmedName) errors.name = "Name is required";
    if (!trimmedCode) errors.code = "Code is required";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the errors below.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, code: trimmedCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed to create department");
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
      router.push("/departments");
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
          <Link href="/departments">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Department</h1>
          <p className="text-muted-foreground">
            Add a new department to the system
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
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
                  onChange={(e) => { setName(e.target.value); setFieldErrors((prev) => ({ ...prev, name: "" })); }}
                  placeholder="e.g. Computer Science"
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
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setFieldErrors((prev) => ({ ...prev, code: "" })); }}
                  placeholder="e.g. CS"
                  required
                  className="uppercase"
                  aria-invalid={!!fieldErrors.code}
                />
                {fieldErrors.code && <FieldError>{fieldErrors.code}</FieldError>}
              </Field>
            </FieldGroup>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create Department"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/departments">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
