"use client";

import { useState } from "react";
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

export default function CreateSemesterPage() {
  const router = useRouter();
  const [year, setYear] = useState(new Date().getFullYear());
  const [semesterType, setSemesterType] = useState<"FALL" | "WINTER" | "SUMMER">("FALL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
          <p className="text-muted-foreground">Add a new semester (year + type)</p>
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
              <Field>
                <FieldLabel htmlFor="year">Year</FieldLabel>
                <Input
                  id="year"
                  type="number"
                  min={1900}
                  max={3000}
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10) || 2024)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Select value={semesterType} onValueChange={(value) => {
                  if (value === "FALL" || value === "WINTER" || value === "SUMMER") {
                    setSemesterType(value);
                  }
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FALL">Fall</SelectItem>
                    <SelectItem value="WINTER">Winter</SelectItem>
                    <SelectItem value="SUMMER">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create Semester"}
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
