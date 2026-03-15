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
import { Plus, Trash2, Pencil, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { SemesterType } from "@/lib/api-types";

type TermWithDetail = {
  id: number;
  semester_id: number;
  course_id: number;
  created_at: string;
  semester_year: number;
  semester_type: SemesterType;
  course_name: string;
  course_code: string;
};

type SortKey = "course_name" | "course_code" | "semester_year" | "semester_type" | null;
type SortDir = "asc" | "desc";

export default function TermsPage() {
  const [terms, setTerms] = useState<TermWithDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TermWithDetail | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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

  const filteredAndSorted = useMemo(() => {
    let list = [...terms];
    const searchLower = search.trim().toLowerCase();
    if (searchLower) {
      list = list.filter(
        (t) =>
          (t.course_name && t.course_name.toLowerCase().includes(searchLower)) ||
          (t.course_code && t.course_code.toLowerCase().includes(searchLower)) ||
          String(t.semester_year).includes(searchLower) ||
          t.semester_type.toLowerCase().includes(searchLower)
      );
    }
    if (filterCourse.trim()) {
      const c = filterCourse.trim().toLowerCase();
      list = list.filter(
        (t) =>
          (t.course_name && t.course_name.toLowerCase().includes(c)) ||
          (t.course_code && t.course_code.toLowerCase().includes(c))
      );
    }
    if (filterYear.trim())
      list = list.filter((t) => String(t.semester_year).includes(filterYear.trim()));
    if (filterType.trim())
      list = list.filter((t) => t.semester_type.toLowerCase().includes(filterType.trim().toLowerCase()));

    if (sortKey) {
      list.sort((a, b) => {
        const aVal = sortKey === "semester_year" ? a.semester_year : (a[sortKey] ?? "");
        const bVal = sortKey === "semester_year" ? b.semester_year : (b[sortKey] ?? "");
        if (typeof aVal === "number" && typeof bVal === "number")
          return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { sensitivity: "base" });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [terms, search, filterCourse, filterYear, filterType, sortKey, sortDir]);

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
      const res = await fetch(`/api/terms/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed to delete term");
        setIsDeleting(false);
        return;
      }
      setTerms(terms.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete term");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Terms</h1>
          <p className="text-muted-foreground">Assign courses to semesters</p>
        </div>
        <Button asChild className="shrink-0 w-fit">
          <Link href="/terms/create" className="flex items-center gap-2">
            <Plus className="size-4" />
            Add Term
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border-[0.5px] border-border shadow-md shadow-black/5">
        <CardHeader className="border-b border-border border-b-[0.5px] bg-muted/20 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">All Course-Term Assignments</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:min-w-[220px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  type="search"
                  placeholder="Search by Course, Year or Type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 border-[0.5px] border-border bg-background focus-visible:ring-1 focus-visible:ring-[#3c096c] focus-visible:border-[#3c096c]/40"
                  aria-label="Search terms"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Filter by Course"
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="w-full sm:w-32 border-[0.5px] border-border text-sm focus-visible:ring-1 focus-visible:ring-[#3c096c]"
                  aria-label="Filter by course"
                />
                <Input
                  placeholder="Filter by Year"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full sm:w-24 border-[0.5px] border-border text-sm focus-visible:ring-1 focus-visible:ring-[#3c096c]"
                  aria-label="Filter by year"
                />
                <Input
                  placeholder="Filter by Type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full sm:w-24 border-[0.5px] border-border text-sm focus-visible:ring-1 focus-visible:ring-[#3c096c]"
                  aria-label="Filter by type"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && <p className="p-6 text-muted-foreground">Loading terms…</p>}
          {error && <p className="p-6 text-destructive">{error}</p>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <Table className="min-w-[480px]">
                <TableHeader>
                  <TableRow className="border-b border-border border-b-[0.5px] bg-[#3c096c]/8 hover:bg-[#3c096c]/10">
                    <TableHead className="h-12 px-4 text-base font-bold text-foreground">
                      <button
                        type="button"
                        onClick={() => handleSort("course_name")}
                        className="inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3c096c] rounded"
                      >
                        Course
                        <SortIcon column="course_name" />
                      </button>
                    </TableHead>
                    <TableHead className="h-12 px-4 text-base font-bold text-foreground">
                      <button
                        type="button"
                        onClick={() => handleSort("semester_year")}
                        className="inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3c096c] rounded"
                      >
                        Semester Year
                        <SortIcon column="semester_year" />
                      </button>
                    </TableHead>
                    <TableHead className="h-12 px-4 text-base font-bold text-foreground">
                      <button
                        type="button"
                        onClick={() => handleSort("semester_type")}
                        className="inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3c096c] rounded"
                      >
                        Semester Type
                        <SortIcon column="semester_type" />
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
                      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                        {terms.length === 0 ? "No term assignments yet." : "No terms match your filters."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSorted.map((term, index) => (
                      <TableRow
                        key={term.id}
                        className={`border-b border-border border-b-[0.5px] transition-colors hover:bg-[#3c096c]/10 ${index % 2 === 1 ? "bg-muted/30" : ""}`}
                      >
                        <TableCell className="py-3 px-4 font-medium align-middle">
                          {term.course_name || term.course_code || `Course #${term.course_id}`}
                        </TableCell>
                        <TableCell className="py-3 px-4 align-middle">{term.semester_year}</TableCell>
                        <TableCell className="py-3 px-4 align-middle">{term.semester_type}</TableCell>
                        <TableCell className="py-3 px-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="outline" size="icon" className="size-8 shrink-0" asChild>
                              <Link href={`/terms/${term.id}/edit`} aria-label={`Edit term`}>
                                <Pencil className="size-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 shrink-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                              onClick={() => setDeleteTarget(term)}
                              aria-label="Remove term"
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
    </div>
  );
}
