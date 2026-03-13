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
import type { TermResponse, SemesterType } from "@/lib/api-types";

type TermWithDetail = TermResponse & {
  semester_year: number;
  semester_type: SemesterType;
  course_name: string;
  course_code: string;
};

export default function TermsPage() {
  const [terms, setTerms] = useState<TermWithDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchTerms() {
      try {
        const res = await fetch("/api/terms");
        if (!res.ok) throw new Error("Failed to load terms");
        const json = await res.json();
        setTerms(json.data ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchTerms();
  }, []);

  const handleDelete = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/terms/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete term");
      setTerms(terms.filter((t) => t.id !== deleteId));
      setDeleteId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete term");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Terms</h1>
          <p className="text-muted-foreground">Assign courses to semesters</p>
        </div>
        <Button asChild>
          <Link href="/terms/create" className="flex items-center gap-2">
            <Plus className="size-4" />
            Add Term
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">All Course-Term Assignments</h2>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-muted-foreground">Loading terms…</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Semester Year</TableHead>
                  <TableHead>Semester Type</TableHead>
                  <TableHead className="w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {terms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground text-center">
                      No term assignments yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  terms.map((term) => (
                    <TableRow key={term.id}>
                      <TableCell className="font-medium">{term.course_name || term.course_code || term.course_id}</TableCell>
                      <TableCell>{term.semester_year}</TableCell>
                      <TableCell>{term.semester_type}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/terms/${term.id}/edit`}>Edit</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteId(term.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                        <AlertDialog
                          open={deleteId === term.id}
                          onOpenChange={(open) => {
                            if (!open) setDeleteId(null);
                          }}
                        >
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Term Assignment?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will unassign the course from the semester.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? "Removing..." : "Remove"}
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
