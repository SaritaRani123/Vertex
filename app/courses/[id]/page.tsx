"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CourseResponse } from "@/lib/api-types";

export default function CourseDetailsPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/courses/${id}`);
        if (!res.ok) {
          setError(res.status === 404 ? "Course not found." : "Failed to load course.");
          return;
        }
        const data = (await res.json()) as CourseResponse;
        if (!cancelled) setCourse(data);
      } catch {
        if (!cancelled) setError("Something went wrong.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <p className="text-muted-foreground p-6">Loading course...</p>;
  if (error || !course) return <p className="text-destructive p-6">{error ?? "Course not found."}</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/courses" aria-label="Back to courses">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{course.name}</h1>
            <p className="text-muted-foreground mt-1 font-mono uppercase">{course.code}</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/courses/${course.id}/edit`}>
            <Pencil className="size-4" />
            Edit
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <p><span className="font-medium">Program:</span> {course.program_name}</p>
          <p><span className="font-medium">Semester:</span> {course.program_semester_sequence ?? "—"}</p>
          <p><span className="font-medium">Type:</span> {course.course_kind === "ELECTIVE" ? "Elective" : "Compulsory"}</p>
          <p><span className="font-medium">Status:</span> {course.status}</p>
          <p><span className="font-medium">Credits:</span> {course.credits}</p>
          <p><span className="font-medium">Lecture/Lab:</span> {course.lecture_hours}h / {course.lab_hours}h</p>
          <p className="sm:col-span-2">
            <span className="font-medium">Prerequisites:</span>{" "}
            {course.prerequisites.length ? course.prerequisites.join(", ") : "None"}
          </p>
          <p className="sm:col-span-2">
            <span className="font-medium">Description:</span>{" "}
            {course.description && course.description.trim() !== "" ? course.description : "—"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
