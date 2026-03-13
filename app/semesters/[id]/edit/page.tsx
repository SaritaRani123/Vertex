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
import type { SemesterResponse } from "@/lib/api-types";

export default function EditSemesterPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [semester, setSemester] = useState<SemesterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [year, setYear] = useState(new Date().getFullYear());
  const [semesterType, setSemesterType] = useState<"FALL" | "WINTER" | "SUMMER">("FALL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (!id) throw new Error("Semester id missing");
        const res = await fetch(`/api/semesters/${id}`);
        if (!res.ok) throw new Error("Failed to load semester");
        const data = await res.json();
        setSemester(data);
        setYear(data.year);
        setSemesterType(data.type);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load semester");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!id) {
      setError("Missing ID");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/semesters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, type: semesterType }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed to update semester");
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

  if (loading) {
    return <p className="text-muted-foreground">Loading semester…</p>;
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  if (!semester) {
    return <p className="text-muted-foreground">Semester not found.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/semesters">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Semester</h1>
          <p className="text-muted-foreground">Update semester details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Semester</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="year">Year</FieldLabel>
                <Input
                  id="year"
                  type="number"
                  min={1900}
                  max={3000}
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
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
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating…" : "Update Semester"}
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
