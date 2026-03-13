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
                      <TableCell>{course.prerequisites?.join(", ") || "—"}</TableCell>
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
