"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { ProgramListItem } from "@/lib/api-types";

type SortKey = "code" | "name" | "department_name" | "duration_years" | "status" | null;
type SortDir = "asc" | "desc";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [filterCode, setFilterCode] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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

  const filteredAndSorted = useMemo(() => {
    let list = [...programs];
    const searchLower = search.trim().toLowerCase();
    if (searchLower) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.code.toLowerCase().includes(searchLower) ||
          p.department_name.toLowerCase().includes(searchLower)
      );
    }
    if (filterCode.trim())
      list = list.filter((p) => p.code.toLowerCase().includes(filterCode.trim().toLowerCase()));
    if (filterName.trim())
      list = list.filter((p) => p.name.toLowerCase().includes(filterName.trim().toLowerCase()));
    if (filterDept.trim())
      list = list.filter((p) => p.department_name.toLowerCase().includes(filterDept.trim().toLowerCase()));

    if (sortKey) {
      list.sort((a, b) => {
        let aVal: string | number = a[sortKey];
        let bVal: string | number = b[sortKey];
        if (typeof aVal === "number" && typeof bVal === "number") return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { sensitivity: "base" });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [programs, search, filterCode, filterName, filterDept, sortKey, sortDir]);

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
      const res = await fetch(`/api/programs/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed to delete program");
        setIsDeleting(false);
        return;
      }
      setPrograms(programs.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete program");
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
          <h1 className="text-2xl font-bold text-foreground">Programs</h1>
          <p className="text-muted-foreground">View and manage academic programs</p>
        </div>
        <Button asChild className="shrink-0 w-fit">
          <Link href="/programs/create" className="flex items-center gap-2">
            <Plus className="size-4" />
            Add Program
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border-[0.5px] border-border shadow-md shadow-black/5">
        <CardHeader className="border-b border-border border-b-[0.5px] bg-muted/20 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">All Programs</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:min-w-[220px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  type="search"
                  placeholder="Search by Name, Code or Department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 border-[0.5px] border-border bg-background focus-visible:ring-1 focus-visible:ring-[#3c096c] focus-visible:border-[#3c096c]/40"
                  aria-label="Search programs"
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
                  placeholder="Filter by Dept"
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="w-full sm:w-28 border-[0.5px] border-border text-sm focus-visible:ring-1 focus-visible:ring-[#3c096c]"
                  aria-label="Filter by department"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && <p className="p-6 text-muted-foreground">Loading programs…</p>}
          {error && <p className="p-6 text-destructive">{error}</p>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="border-b border-border border-b-[0.5px] bg-[#3c096c]/8 hover:bg-[#3c096c]/10">
                    <Th sortKeyName="code">Code</Th>
                    <Th sortKeyName="name">Name</Th>
                    <Th sortKeyName="department_name">Department</Th>
                    <Th sortKeyName="duration_years">Duration</Th>
                    <Th sortKeyName="status">Status</Th>
                    <TableHead className="h-12 px-4 w-[120px] text-base font-bold text-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSorted.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        {programs.length === 0 ? "No programs yet. Create one to get started." : "No programs match your filters."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSorted.map((prog, index) => (
                      <TableRow
                        key={prog.id}
                        className={`border-b border-border border-b-[0.5px] transition-colors hover:bg-[#3c096c]/10 ${index % 2 === 1 ? "bg-muted/30" : ""}`}
                      >
                        <TableCell className="py-3 px-4 font-medium align-middle">{prog.code}</TableCell>
                        <TableCell className="py-3 px-4 align-middle">{prog.name}</TableCell>
                        <TableCell className="py-3 px-4 align-middle">{prog.department_name}</TableCell>
                        <TableCell className="py-3 px-4 align-middle">{prog.duration_years} years</TableCell>
                        <TableCell className="py-3 px-4 align-middle">
                          <Badge variant={prog.status === "ACTIVE" ? "default" : "secondary"}>{prog.status}</Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="outline" size="icon" className="size-8 shrink-0" asChild>
                              <Link href={`/programs/${prog.id}/edit`} aria-label={`Edit ${prog.name}`}>
                                <Pencil className="size-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 shrink-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                              onClick={() => setDeleteTarget({ id: prog.id, name: prog.name })}
                              aria-label={`Delete ${prog.name}`}
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
            <AlertDialogTitle>Delete Program?</AlertDialogTitle>
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
