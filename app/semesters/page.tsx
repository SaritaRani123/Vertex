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
import type { SemesterResponse } from "@/lib/api-types";

export default function SemestersPage() {
  const [semesters, setSemesters] = useState<SemesterResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchSemesters() {
      try {
        const res = await fetch("/api/semesters");
        if (!res.ok) throw new Error("Failed to load semesters");
        const json = await res.json();
        setSemesters(json.data ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchSemesters();
  }, []);

  const handleDelete = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/semesters/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete semester");
      setSemesters(semesters.filter((s) => s.id !== deleteId));
      setDeleteId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete semester");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Semesters</h1>
          <p className="text-muted-foreground">View and manage semester periods</p>
        </div>
        <Button asChild>
          <Link href="/semesters/create" className="flex items-center gap-2">
            <Plus className="size-4" />
            Add Semester
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">All Semesters</h2>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-muted-foreground">Loading semesters…</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {semesters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground text-center">
                      No semesters yet. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  semesters.map((semester) => (
                    <TableRow key={semester.id}>
                      <TableCell className="font-medium">{semester.year}</TableCell>
                      <TableCell>{semester.type}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/semesters/${semester.id}/edit`}>Edit</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteId(semester.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                        <AlertDialog
                          open={deleteId === semester.id}
                          onOpenChange={(open) => {
                            if (!open) setDeleteId(null);
                          }}
                        >
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Semester?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. Are you sure you want to delete {semester.year} {semester.type}?
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
