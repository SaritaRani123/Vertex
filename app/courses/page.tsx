"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2 } from "lucide-react";
import type { CourseResponse } from "@/lib/api-types";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses");
        if (!res.ok) throw new Error("Failed to load courses");
        const json = await res.json();
        setCourses(json.data ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  function PrerequisiteTooltipContent({ c }: { c: CourseResponse }) {
    return (
      <div className="space-y-1.5">
        <div className="font-medium">{c.name}</div>
        <div className="text-muted-foreground text-xs">{c.code}</div>
        {c.description != null && c.description !== "" && (
          <p className="text-muted-foreground text-xs">{c.description}</p>
        )}
        <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
          <span>Credits: {c.credits}</span>
          <span>Lecture: {c.lecture_hours}h</span>
          <span>Lab: {c.lab_hours}h</span>
          <span>Status: {c.status}</span>
          {c.program_name !== "" && <span>Program: {c.program_name}</span>}
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/courses/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete course");
      setCourses(courses.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete course");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-muted-foreground">View and manage all courses</p>
        </div>
        <Button asChild>
          <Link href="/courses/create" className="flex items-center gap-2">
            <Plus className="size-4" />
            Add Course
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">All Courses</h2>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-muted-foreground">Loading courses…</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Prerequisites</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Lecture</TableHead>
                  <TableHead>Lab</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-muted-foreground text-center">
                      No courses yet. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.code}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.description || "—"}</TableCell>
                      <TableCell>
                        {course.prerequisites && course.prerequisites.length > 0 ? (
                          <span className="flex flex-wrap gap-1">
                            {course.prerequisites.map((code) => {
                              const prereqCourse = courses.find((c) => c.code === code);
                              if (prereqCourse) {
                                return (
                                  <Tooltip key={code} delayMs={300}>
                                    <TooltipTrigger>
                                      <span className="text-muted-foreground cursor-default rounded bg-muted px-1.5 py-0.5 text-xs hover:bg-muted/80">
                                        {code}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs">
                                      <PrerequisiteTooltipContent c={prereqCourse} />
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              }
                              return (
                                <span key={code} className="text-muted-foreground rounded bg-muted px-1.5 py-0.5 text-xs">
                                  {code}
                                </span>
                              );
                            })}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{course.program_name}</TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell>{course.lecture_hours}</TableCell>
                      <TableCell>{course.lab_hours}</TableCell>
                      <TableCell>{course.status}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/courses/${course.id}/edit`}>Edit</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteId(course.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                        <AlertDialog
                          open={deleteId === course.id}
                          onOpenChange={(open) => {
                            if (!open) setDeleteId(null);
                          }}
                        >
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Course?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. Are you sure you want to delete {course.name}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
