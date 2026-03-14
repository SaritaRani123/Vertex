"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { ProgramListItem } from "@/lib/api-types";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const res = await fetch("/api/programs");
        if (!res.ok) throw new Error("Failed to load programs");
        const json = await res.json();
        setPrograms(json.data ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchPrograms();
  }, []);

  const handleDelete = async () => {
    if (deleteId === null) return;
    setError(null);
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/programs/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed to delete program");
        setIsDeleting(false);
        return;
      }
      setPrograms(programs.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete program");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Programs</h1>
          <p className="text-muted-foreground">
            View and manage academic programs
          </p>
        </div>
        <Button asChild>
          <Link href="/programs/create" className="flex items-center gap-2">
            <Plus className="size-4" />
            Add Program
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">All Programs</h2>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className="text-muted-foreground">Loading programs…</p>
          )}
          {error && (
            <p className="text-destructive">{error}</p>
          )}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground text-center">
                      No programs yet. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  programs.map((prog) => (
                    <TableRow key={prog.id}>
                      <TableCell className="font-medium">{prog.code}</TableCell>
                      <TableCell>{prog.name}</TableCell>
                      <TableCell>{prog.department_name}</TableCell>
                      <TableCell>{prog.duration_years} years</TableCell>
                      <TableCell>
                        <Badge variant={prog.status === "ACTIVE" ? "default" : "secondary"}>
                          {prog.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/programs/${prog.id}/edit`}>Edit</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteId(prog.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                        <AlertDialog open={deleteId === prog.id} onOpenChange={(open) => {
                          if (!open) setDeleteId(null);
                        }}>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Program?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. Are you sure you want to delete {prog.name}?
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
