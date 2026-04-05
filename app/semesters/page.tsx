"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListSearchField } from "@/components/list-search-field";
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
import { Plus, Trash2, Pencil, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { SemesterResponse } from "@/lib/api-types";
import { GuardedCreateButton } from "@/components/guarded-create-button";
import { useStaffActionGuard } from "@/hooks/use-staff-action-guard";

type SortKey = "year" | "type" | null;
type SortDir = "asc" | "desc";

export default function SemestersPage() {
  const [semesters, setSemesters] = useState<SemesterResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; year: number; type: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const { guardAction, blockedDialog, sessionLoading } = useStaffActionGuard();

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

  const filteredAndSorted = useMemo(() => {
    let list = [...semesters];
    const searchLower = search.trim().toLowerCase();
    if (searchLower) {
      list = list.filter(
        (s) =>
          String(s.year).includes(searchLower) ||
          s.type.toLowerCase().includes(searchLower)
      );
    }

    if (sortKey) {
      list.sort((a, b) => {
        if (sortKey === "year") {
          const cmp = a.year - b.year;
          return sortDir === "asc" ? cmp : -cmp;
        }
        const cmp = a.type.localeCompare(b.type, undefined, { sensitivity: "base" });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [semesters, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (!key) return;
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    setError(null);
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/semesters/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed to delete semester");
        setIsDeleting(false);
        return;
      }
      setSemesters(semesters.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete semester");
    } finally {
      setIsDeleting(false);
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="size-3.5 opacity-50" aria-hidden />;
    return sortDir === "asc" ? (
      <ArrowUp className="size-3.5 text-primary" aria-hidden />
    ) : (
      <ArrowDown className="size-3.5 text-primary" aria-hidden />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Semesters</h1>
          <p className="text-muted-foreground">View and manage semester periods</p>
        </div>
        <GuardedCreateButton href="/semesters/create" className="shrink-0 w-fit flex items-center gap-2">
          <Plus className="size-4" />
          Add Semester
        </GuardedCreateButton>
      </div>

      <Card className="overflow-hidden border-[0.5px] border-border shadow-md shadow-black/5">
        <CardHeader className="border-b border-border border-b-[0.5px] bg-muted/20 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">All Semesters</h2>
            <ListSearchField
              value={search}
              onChange={setSearch}
              placeholder="Search by year or type (e.g. 2024, fall)…"
              ariaLabel="Search semesters"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && <p className="p-6 text-muted-foreground">Loading semesters...</p>}
          {error && <p className="p-6 text-destructive">{error}</p>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <Table className="min-w-[360px]">
                <TableHeader>
                  <TableRow className="border-b border-border border-b-[0.5px] bg-primary/8 hover:bg-primary/10">
                    <TableHead className="h-12 px-4 text-base font-bold text-foreground">
                      <button
                        type="button"
                        onClick={() => handleSort("year")}
                        className="inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                      >
                        Year
                        <SortIcon column="year" />
                      </button>
                    </TableHead>
                    <TableHead className="h-12 px-4 text-base font-bold text-foreground">
                      <button
                        type="button"
                        onClick={() => handleSort("type")}
                        className="inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                      >
                        Type
                        <SortIcon column="type" />
                      </button>
                    </TableHead>
                    <TableHead className="h-12 px-4 w-[120px] text-base font-bold text-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSorted.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                        {semesters.length === 0
                          ? "No semesters yet. Create one to get started."
                          : "No semesters match your filters."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSorted.map((semester, index) => (
                      <TableRow
                        key={semester.id}
                        className={`border-b border-border border-b-[0.5px] transition-colors hover:bg-primary/10 ${index % 2 === 1 ? "bg-muted/30" : ""}`}
                      >
                        <TableCell className="py-3 px-4 font-medium align-middle">{semester.year}</TableCell>
                        <TableCell className="py-3 px-4 align-middle">{semester.type}</TableCell>
                        <TableCell className="py-3 px-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="outline" size="icon" className="size-8 shrink-0" asChild>
                              <Link href={`/semesters/${semester.id}/edit`} aria-label={`Edit ${semester.year} ${semester.type}`}>
                                <Pencil className="size-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 shrink-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                              disabled={sessionLoading}
                              onClick={() =>
                                guardAction(() =>
                                  setDeleteTarget({
                                    id: semester.id,
                                    year: semester.year,
                                    type: semester.type,
                                  })
                                )
                              }
                              aria-label={`Delete ${semester.year} ${semester.type}`}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Semester?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete {deleteTarget?.year} {deleteTarget?.type}?
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
      {blockedDialog}
    </div>
  );
}

