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
import type { DepartmentResponse } from "@/lib/api-types";

type SortKey = "name" | "code" | null;
type SortDir = "asc" | "desc";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [filterCode, setFilterCode] = useState("");
  const [filterName, setFilterName] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch("/api/departments");
        if (!res.ok) throw new Error("Failed to load departments");
        const json = await res.json();
        setDepartments(json.data ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchDepartments();
  }, []);

  const filteredAndSorted = useMemo(() => {
    let list = [...departments];

    const searchLower = search.trim().toLowerCase();
    if (searchLower) {
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(searchLower) ||
          d.code.toLowerCase().includes(searchLower)
      );
    }
    if (filterCode.trim()) {
      const codeLower = filterCode.trim().toLowerCase();
      list = list.filter((d) => d.code.toLowerCase().includes(codeLower));
    }
    if (filterName.trim()) {
      const nameLower = filterName.trim().toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(nameLower));
    }

    if (sortKey) {
      list.sort((a, b) => {
        const aVal = sortKey === "name" ? a.name : a.code;
        const bVal = sortKey === "name" ? b.name : b.code;
        const cmp = aVal.localeCompare(bVal, undefined, { sensitivity: "base" });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return list;
  }, [departments, search, filterCode, filterName, sortKey, sortDir]);

  const handleSort = (key: "name" | "code") => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    setError(null);
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/departments/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed to delete department");
        setIsDeleting(false);
        return;
      }
      setDepartments(departments.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete department");
    } finally {
      setIsDeleting(false);
    }
  };

  const SortIcon = ({ column }: { column: "name" | "code" }) => {
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
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-muted-foreground">
            View and manage all departments
          </p>
        </div>
        <Button asChild className="shrink-0 w-fit">
          <Link href="/departments/create" className="flex items-center gap-2">
            <Plus className="size-4" />
            Add Department
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border-[0.5px] border-border shadow-md shadow-black/5">
        <CardHeader className="border-b border-border border-b-[0.5px] bg-muted/20 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">All Departments</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:min-w-[220px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  type="search"
                  placeholder="Search by Name or Code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 border-[0.5px] border-border bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/40"
                  aria-label="Search departments by name or code"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Filter by Code"
                  value={filterCode}
                  onChange={(e) => setFilterCode(e.target.value)}
                  className="w-full sm:w-32 border-[0.5px] border-border text-sm focus-visible:ring-1 focus-visible:ring-primary"
                  aria-label="Filter by code"
                />
                <Input
                  type="text"
                  placeholder="Filter by Name"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="w-full sm:w-36 border-[0.5px] border-border text-sm focus-visible:ring-1 focus-visible:ring-primary"
                  aria-label="Filter by name"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <p className="p-6 text-muted-foreground">Loading departmentsâ€¦</p>
          )}
          {error && (
            <p className="p-6 text-destructive">{error}</p>
          )}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <Table className="min-w-[400px]">
                <TableHeader>
                  <TableRow className="border-b border-border border-b-[0.5px] bg-primary/8 hover:bg-primary/10">
                    <TableHead className="h-12 px-4 text-base font-bold text-foreground">
                      <button
                        type="button"
                        onClick={() => handleSort("code")}
                        className="inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                      >
                        Code
                        <SortIcon column="code" />
                      </button>
                    </TableHead>
                    <TableHead className="h-12 px-4 text-base font-bold text-foreground">
                      <button
                        type="button"
                        onClick={() => handleSort("name")}
                        className="inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                      >
                        Name
                        <SortIcon column="name" />
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
                        {departments.length === 0
                          ? "No departments yet. Create one to get started."
                          : "No departments match your filters."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSorted.map((dept, index) => (
                      <TableRow
                        key={dept.id}
                        className={`border-b border-border border-b-[0.5px] transition-colors hover:bg-primary/10 ${index % 2 === 1 ? "bg-muted/30" : ""}`}
                      >
                        <TableCell className="py-3 px-4 font-medium align-middle">
                          {dept.code}
                        </TableCell>
                        <TableCell className="py-3 px-4 align-middle">
                          {dept.name}
                        </TableCell>
                        <TableCell className="py-3 px-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="outline" size="icon" className="size-8 shrink-0" asChild>
                              <Link href={`/departments/${dept.id}/edit`} aria-label={`Edit ${dept.name}`}>
                                <Pencil className="size-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 shrink-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                              onClick={() => setDeleteTarget({ id: dept.id, name: dept.name })}
                              aria-label={`Delete ${dept.name}`}
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

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete{" "}
              {deleteTarget?.name}?
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

