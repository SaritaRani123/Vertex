"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Plus, Trash2, Pencil, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { ProgramListItem } from "@/lib/api-types";
import { GuardedCreateButton } from "@/components/guarded-create-button";
import { useStaffActionGuard } from "@/hooks/use-staff-action-guard";
import { ListSearchField } from "@/components/list-search-field";

type SortKey = "code" | "name" | "department_name" | "duration_years" | "status" | null;
type SortDir = "asc" | "desc";

function ProgramsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const departmentIdParam = searchParams.get("department_id");
  const departmentIdFromUrl =
    departmentIdParam != null && departmentIdParam !== ""
      ? parseInt(departmentIdParam, 10)
      : NaN;
  const filterByDepartmentId =
    Number.isFinite(departmentIdFromUrl) && departmentIdFromUrl > 0 ? departmentIdFromUrl : null;

  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [departmentFilterLabel, setDepartmentFilterLabel] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const { guardAction, blockedDialog, sessionLoading } = useStaffActionGuard();

  useEffect(() => {
    if (filterByDepartmentId == null) {
      setDepartmentFilterLabel(null);
      return;
    }
    let cancelled = false;
    async function loadDeptName() {
      try {
        const res = await fetch(`/api/departments/${filterByDepartmentId}`);
        if (!res.ok) return;
        const d = (await res.json()) as { name?: string };
        if (!cancelled && d.name) {
          setDepartmentFilterLabel(d.name);
        }
      } catch {
        /* ignore */
      }
    }
    void loadDeptName();
    return () => {
      cancelled = true;
    };
  }, [filterByDepartmentId]);

  useEffect(() => {
    let cancelled = false;
    async function fetchPrograms() {
      setLoading(true);
      setError(null);
      try {
        const url =
          filterByDepartmentId != null
            ? `/api/programs?department_id=${filterByDepartmentId}`
            : "/api/programs";
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load programs");
        const json = await res.json();
        if (!cancelled) setPrograms(json.data ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void fetchPrograms();
    return () => {
      cancelled = true;
    };
  }, [filterByDepartmentId]);

  const filteredAndSorted = useMemo(() => {
    let list = [...programs];
    const searchLower = search.trim().toLowerCase();
    if (searchLower) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.code.toLowerCase().includes(searchLower) ||
          p.department_name.toLowerCase().includes(searchLower) ||
          p.status.toLowerCase().includes(searchLower) ||
          String(p.duration_years).includes(searchLower)
      );
    }

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
  }, [programs, search, sortKey, sortDir]);

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
      <ArrowUp className="size-3.5 text-primary" aria-hidden />
    ) : (
      <ArrowDown className="size-3.5 text-primary" aria-hidden />
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
          <h1 className="text-2xl font-bold text-foreground">Programs</h1>
        </div>
        <GuardedCreateButton href="/programs/create" className="shrink-0 w-fit flex items-center gap-2">
          <Plus className="size-4" />
          Add Program
        </GuardedCreateButton>
      </div>

      {filterByDepartmentId != null ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
          <span className="text-foreground">
            {departmentFilterLabel ? (
              <>
                Showing programs in <span className="font-semibold">{departmentFilterLabel}</span>
              </>
            ) : (
              "Applying department filter…"
            )}
          </span>
          <Button variant="outline" size="sm" className="h-8" asChild>
            <Link href="/programs">Show all programs</Link>
          </Button>
        </div>
      ) : null}

      <Card className="overflow-hidden border-[0.5px] border-border shadow-md shadow-black/5">
        <CardHeader className="border-b border-border border-b-[0.5px] bg-muted/20 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">All Programs</h2>
            <ListSearchField
              value={search}
              onChange={setSearch}
              placeholder="Search name, code, department, status, duration…"
              ariaLabel="Search programs"
              clearActive={filterByDepartmentId != null}
              onClear={() => {
                setSearch("");
                if (filterByDepartmentId != null) router.push("/programs");
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && <p className="p-6 text-muted-foreground">Loading programs...</p>}
          {error && <p className="p-6 text-destructive">{error}</p>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="border-b border-border border-b-[0.5px] bg-primary/8 hover:bg-primary/10">
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
                        role="link"
                        tabIndex={0}
                        className={`border-b border-border border-b-[0.5px] cursor-pointer transition-colors hover:bg-primary/10 ${index % 2 === 1 ? "bg-muted/30" : ""}`}
                        onClick={() => router.push(`/programs/${prog.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            router.push(`/programs/${prog.id}`);
                          }
                        }}
                      >
                        <TableCell className="py-3 px-4 font-mono text-sm font-medium uppercase tracking-wide align-middle">
                          {prog.code}
                        </TableCell>
                        <TableCell className="py-3 px-4 align-middle">{prog.name}</TableCell>
                        <TableCell className="py-3 px-4 align-middle" onClick={(e) => e.stopPropagation()}>
                          <Button variant="link" className="text-primary h-auto min-h-0 p-0 font-medium" asChild>
                            <Link href={`/programs?department_id=${prog.department_id}`}>
                              {prog.department_name || `Department #${prog.department_id}`}
                            </Link>
                          </Button>
                        </TableCell>
                        <TableCell className="py-3 px-4 align-middle">{prog.duration_years} years</TableCell>
                        <TableCell className="py-3 px-4 align-middle">
                          <Badge variant={prog.status === "ACTIVE" ? "default" : "secondary"}>{prog.status}</Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="outline" size="icon" className="size-8 shrink-0" asChild>
                              <Link
                                href={`/programs/${prog.id}/edit`}
                                aria-label={`Edit ${prog.name}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Pencil className="size-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 shrink-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                              disabled={sessionLoading}
                              onClick={(e) => {
                                e.stopPropagation();
                                guardAction(() => setDeleteTarget({ id: prog.id, name: prog.name }));
                              }}
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
      {blockedDialog}
    </div>
  );
}

export default function ProgramsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-muted-foreground">Loading programs…</p>}>
      <ProgramsPageInner />
    </Suspense>
  );
}
