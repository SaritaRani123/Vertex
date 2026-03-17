"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Plus, Trash2, Pencil, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { CourseResponse } from "@/lib/api-types";

type SortKey = "code" | "name" | "program_name" | "credits" | "status" | null;
type SortDir = "asc" | "desc";

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [filterCode, setFilterCode] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.code.toLowerCase().includes(searchLower) ||
          (c.program_name && c.program_name.toLowerCase().includes(searchLower))
      );
    }
    if (filterCode.trim())
      list = list.filter((c) => c.code.toLowerCase().includes(filterCode.trim().toLowerCase()));
    if (filterName.trim())
      list = list.filter((c) => c.name.toLowerCase().includes(filterName.trim().toLowerCase()));
    if (filterProgram.trim())
      list = list.filter((c) => c.program_name?.toLowerCase().includes(filterProgram.trim().toLowerCase()));

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
  }, [courses, search, filterCode, filterName, filterProgram, sortKey, sortDir]);

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
      const res = await fetch(`/api/courses/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed to delete course");
        setIsDeleting(false);
        return;
      }
      setCourses(courses.filter((c) => c.id !== deleteTarget.id));
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
      <ArrowUp className="size-3.5 text-[#3c096c]" aria-hidden />
    ) : (
      <ArrowDown className="size-3.5 text-[#3c096c]" aria-hidden />
    );
  };

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

  const Th = ({ sortKeyName, children }: { sortKeyName: SortKey; children: React.ReactNode }) => (
    <TableHead className="h-12 px-4 text-base font-bold text-foreground">
      <button
        type="button"
        onClick={() => handleSort(sortKeyName)}
        className="inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3c096c] rounded"
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
          <h1 className="text-2xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground">View and manage all courses</p>
        </div>
        <Button asChild className="shrink-0 w-fit">
          <Link href="/courses/create" className="flex items-center gap-2">
            <Plus className="size-4" />
            Add Course
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border-[0.5px] border-border shadow-md shadow-black/5">
        <CardHeader className="border-b border-border border-b-[0.5px] bg-muted/20 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">All Courses</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:min-w-[220px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  type="search"
                  placeholder="Search by Name, Code or Program..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 border-[0.5px] border-border bg-background focus-visible:ring-1 focus-visible:ring-[#3c096c] focus-visible:border-[#3c096c]/40"
                  aria-label="Search courses"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Filter by Code"
                  value={filterCode}
                  onChange={(e) => setFilterCode(e.target.value)}
                  className="w-full sm:w-28 border-[0.5px] border-border text-sm focus-visible:ring-1 focus-visible:ring-[#3c096c]"
                  aria-label="Filter by code"
                />
                <Input
                  placeholder="Filter by Name"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="w-full sm:w-32 border-[0.5px] border-border text-sm focus-visible:ring-1 focus-visible:ring-[#3c096c]"
                  aria-label="Filter by name"
                />
                <Input
                  placeholder="Filter by Program"
                  value={filterProgram}
                  onChange={(e) => setFilterProgram(e.target.value)}
                  className="w-full sm:w-28 border-[0.5px] border-border text-sm focus-visible:ring-1 focus-visible:ring-[#3c096c]"
                  aria-label="Filter by program"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && <p className="p-6 text-muted-foreground">Loading courses…</p>}
          {error && <p className="p-6 text-destructive">{error}</p>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow className="border-b border-border border-b-[0.5px] bg-[#3c096c]/8 hover:bg-[#3c096c]/10">
                    <Th sortKeyName="code">Code</Th>
                    <Th sortKeyName="name">Name</Th>
                    <TableHead className="h-12 px-4 text-base font-bold text-foreground">Description</TableHead>
                    <TableHead className="h-12 px-4 text-base font-bold text-foreground">Prerequisites</TableHead>
                    <Th sortKeyName="program_name">Program</Th>
                    <Th sortKeyName="credits">Credits</Th>
                    <TableHead className="h-12 px-4 text-base font-bold text-foreground">Lecture</TableHead>
                    <TableHead className="h-12 px-4 text-base font-bold text-foreground">Lab</TableHead>
                    <Th sortKeyName="status">Status</Th>
                    <TableHead className="h-12 px-4 w-[120px] text-base font-bold text-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSorted.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                        {courses.length === 0 ? "No courses yet. Create one to get started." : "No courses match your filters."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSorted.map((course, index) => (
                      <TableRow
                        key={course.id}
                        className={`border-b border-border border-b-[0.5px] transition-colors hover:bg-[#3c096c]/10 ${index % 2 === 1 ? "bg-muted/30" : ""}`}
                      >
                        <TableCell className="py-3 px-4 font-medium align-middle">{course.code}</TableCell>
                        <TableCell className="py-3 px-4 align-middle">{course.name}</TableCell>
                        <TableCell className="py-3 px-4 align-middle max-w-[180px] truncate" title={course.description ?? undefined}>
                          {course.description || "—"}
                        </TableCell>
                        <TableCell className="py-3 px-4 align-middle">
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
                        <TableCell className="py-3 px-4 align-middle">{course.program_name}</TableCell>
                        <TableCell className="py-3 px-4 align-middle">{course.credits}</TableCell>
                        <TableCell className="py-3 px-4 align-middle">{course.lecture_hours}</TableCell>
                        <TableCell className="py-3 px-4 align-middle">{course.lab_hours}</TableCell>
                        <TableCell className="py-3 px-4 align-middle">
                          <span
                            className={`inline-block min-w-[5.5rem] rounded-md px-2.5 py-1 text-center text-sm font-medium text-white ${
                              course.status === "ACTIVE"
                                ? "bg-green-600"
                                : course.status === "INACTIVE"
                                  ? "bg-red-600"
                                  : "bg-gray-500"
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
                              onClick={() => setDeleteTarget({ id: course.id, name: course.name })}
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
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
