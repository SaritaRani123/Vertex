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
import type { CourseResponse } from "@/lib/api-types";
import { GuardedCreateButton } from "@/components/guarded-create-button";
import { useStaffActionGuard } from "@/hooks/use-staff-action-guard";

type SortKey = "code" | "name" | "program_name" | "credits" | "status" | null;
type SortDir = "asc" | "desc";

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string; code: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { guardAction, blockedDialog, sessionLoading } = useStaffActionGuard();

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

  const filteredAndSorted = useMemo(() => {
    let list = [...courses];
    const searchLower = search.trim().toLowerCase();
    if (searchLower) {
      list = list.filter((c) => {
        const pool =
          c.elective_group_id != null
            ? (c.elective_group_label?.trim() || `pool ${c.elective_group_id}`).toLowerCase()
            : "";
        const sem = c.program_semester_sequence != null ? String(c.program_semester_sequence) : "";
        const desc = (c.description ?? "").toLowerCase();
        const kind = (c.course_kind === "ELECTIVE" ? "elective" : "compulsory").toLowerCase();
        const prereqHit = (c.prerequisites ?? []).some((p) => p.toLowerCase().includes(searchLower));
        return (
          c.name.toLowerCase().includes(searchLower) ||
          c.code.toLowerCase().includes(searchLower) ||
          (c.program_name && c.program_name.toLowerCase().includes(searchLower)) ||
          c.status.toLowerCase().includes(searchLower) ||
          desc.includes(searchLower) ||
          sem.includes(searchLower) ||
          kind.includes(searchLower) ||
          (pool && pool.includes(searchLower)) ||
          String(c.credits).includes(searchLower) ||
          String(c.lecture_hours).includes(searchLower) ||
          String(c.lab_hours).includes(searchLower) ||
          prereqHit
        );
      });
    }

    if (sortKey) {
      list.sort((a, b) => {
        const aVal = sortKey === "credits" ? a.credits : (a[sortKey] ?? "");
        const bVal = sortKey === "credits" ? b.credits : (b[sortKey] ?? "");
        if (typeof aVal === "number" && typeof bVal === "number")
          return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { sensitivity: "base" });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [courses, search, sortKey, sortDir]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage]);

  const handleSort = (key: SortKey) => {
    if (!key) return;
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const dependentCourses = useMemo(() => {
    if (!deleteTarget) return [];
    return courses.filter((c) => (c.prerequisites ?? []).includes(deleteTarget.code));
  }, [deleteTarget, courses]);

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    const targetId = deleteTarget.id;
    const targetCode = deleteTarget.code;
    setError(null);
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/courses/${targetId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed to delete course");
        setIsDeleting(false);
        return;
      }
      setCourses(
        courses
          .filter((c) => c.id !== targetId)
          .map((c) =>
            (c.prerequisites ?? []).includes(targetCode)
              ? { ...c, prerequisites: c.prerequisites.filter((p) => p !== targetCode) }
              : c
          )
      );
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete course");
    } finally {
      setIsDeleting(false);
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="size-3.5 opacity-50" aria-hidden />;
    return sortDir === "asc" ? (
      <ArrowUp className="size-3.5 text-foreground" aria-hidden />
    ) : (
      <ArrowDown className="size-3.5 text-foreground" aria-hidden />
    );
  };

  const Th = ({ sortKeyName, children }: { sortKeyName: SortKey; children: React.ReactNode }) => (
    <TableHead className="h-12 px-4 text-base font-bold text-foreground">
      <button
        type="button"
        onClick={() => handleSort(sortKeyName)}
        className="inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        {children}
        <SortIcon column={sortKeyName} />
      </button>
    </TableHead>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Courses</h1>
        </div>
        <GuardedCreateButton href="/courses/create" className="shrink-0 w-fit flex items-center gap-2">
          <Plus className="size-4" />
          Add Course
        </GuardedCreateButton>
      </div>

      <Card className="overflow-hidden border-[0.5px] border-border shadow-md shadow-black/5">
        <CardHeader className="border-b border-border border-b-[0.5px] bg-muted/20 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">All Courses</h2>
            <ListSearchField
              value={search}
              onChange={setSearch}
              placeholder="Search by code, name, program, type, status…"
              ariaLabel="Search courses"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && <p className="p-6 text-muted-foreground">Loading courses...</p>}
          {error && <p className="p-6 text-destructive">{error}</p>}
          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-[760px] text-[0.95rem]">
                <TableHeader>
                  <TableRow className="border-b border-border border-b-[0.5px] bg-muted/50 hover:bg-muted/60">
                    <Th sortKeyName="code">Code</Th>
                    <Th sortKeyName="name">Name</Th>
                    <Th sortKeyName="program_name">Program</Th>
                    <TableHead className="h-12 px-4 text-base font-bold text-foreground">Type</TableHead>
                    <Th sortKeyName="credits">Credits</Th>
                    <Th sortKeyName="status">Status</Th>
                    <TableHead className="h-12 px-4 w-[120px] text-base font-bold text-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSorted.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        {courses.length === 0 ? "No courses yet. Create one to get started." : "No courses match your filters."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCourses.map((course, index) => (
                      <TableRow
                        key={course.id}
                        className={`border-b border-border border-b-[0.5px] transition-colors hover:bg-muted/40 ${index % 2 === 1 ? "bg-muted/20" : ""}`}
                      >
                        <TableCell className="py-3 px-4 align-middle font-mono text-sm font-medium uppercase tracking-wide">
                          {course.code}
                        </TableCell>
                        <TableCell className="py-3 px-4 align-middle">
                          <Link
                            href={`/courses/${course.id}`}
                            className="font-medium text-foreground hover:text-primary hover:underline underline-offset-4"
                            aria-label={`Open ${course.name} details`}
                          >
                            {course.name}
                          </Link>
                        </TableCell>
                        <TableCell className="py-3 px-4 align-middle">{course.program_name}</TableCell>
                        <TableCell className="py-3 px-4 align-middle">
                          <span className="text-sm font-medium">
                            {course.course_kind === "ELECTIVE" ? "Elective" : "Compulsory"}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 px-4 align-middle">{course.credits}</TableCell>
                        <TableCell className="py-3 px-4 align-middle">
                          <span
                            className={`inline-block min-w-[5.5rem] rounded-md px-2.5 py-1 text-center text-sm font-medium text-white ${
                              course.status === "ACTIVE"
                                ? "bg-emerald-600"
                                : course.status === "INACTIVE"
                                  ? "bg-amber-600"
                                  : "bg-slate-500"
                            }`}
                          >
                            {course.status}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 px-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="outline" size="icon" className="size-8 shrink-0" asChild>
                              <Link href={`/courses/${course.id}/edit`} aria-label={`Edit ${course.name}`}>
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
                                    id: course.id,
                                    name: course.name,
                                    code: course.code,
                                  })
                                )
                              }
                              aria-label={`Delete ${course.name}`}
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
              {filteredAndSorted.length > 0 ? (
                <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, filteredAndSorted.length)} of {filteredAndSorted.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete {deleteTarget?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {dependentCourses.length > 0 && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2">
              <p className="text-sm font-medium text-destructive">
                This course is a prerequisite for the following {dependentCourses.length === 1 ? "course" : "courses"}:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                {dependentCourses.map((c) => (
                  <li key={c.id} className="text-sm text-foreground">
                    {c.name} <span className="text-muted-foreground">({c.code})</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground">It will be removed from their prerequisites automatically.</p>
            </div>
          )}
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

