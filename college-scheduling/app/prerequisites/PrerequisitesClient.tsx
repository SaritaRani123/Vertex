"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/tables/DataTable";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import type { Prerequisite, Subject } from "@/types";
import { Plus, Trash2 } from "lucide-react";

export function PrerequisitesClient({
  initialData,
  subjectLabels,
  subjects,
  subjectOptions,
}: {
  initialData: Prerequisite[];
  subjectLabels: Record<string, string>;
  subjects: Subject[];
  subjectOptions: { value: string; label: string }[];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "Admin";
  const [data, setData] = useState<Prerequisite[]>(initialData);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [dependsOnId, setDependsOnId] = useState("");
  const [addError, setAddError] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredData = useMemo(() => {
    let list = data;
    if (subjectFilter && subjectFilter !== "all") {
      list = list.filter((p) => p.subjectId === subjectFilter || p.dependsOnId === subjectFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          (subjectLabels[p.subjectId] ?? "").toLowerCase().includes(q) ||
          (subjectLabels[p.dependsOnId] ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, search, subjectFilter, subjectLabels]);

  const refresh = useCallback(() => {
    router.refresh();
    fetch("/api/prerequisites")
      .then((r) => r.json())
      .then((list) => Array.isArray(list) && setData(list))
      .catch(() => {});
  }, [router]);

  async function handleAdd() {
    setAddError("");
    if (!subjectId || !dependsOnId) {
      setAddError("Select both subject and prerequisite");
      return;
    }
    if (subjectId === dependsOnId) {
      setAddError("Subject cannot depend on itself");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/prerequisites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, dependsOnId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to add");
      setAddOpen(false);
      setSubjectId("");
      setDependsOnId("");
      refresh();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/prerequisites/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to delete");
    }
    setDeleteId(null);
    refresh();
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Prerequisites</CardTitle>
          {isAdmin && (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add prerequisite
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchFilterBar
            searchPlaceholder="Search by subject or prerequisite..."
            searchValue={search}
            onSearchChange={setSearch}
            filterLabel="Subject"
            filterValue={subjectFilter}
            filterOptions={subjectOptions}
            onFilterChange={setSubjectFilter}
            filterPlaceholder="All subjects"
          />
          <DataTable<Prerequisite>
            data={filteredData}
            keyExtractor={(p) => p.id}
            columns={[
              {
                key: "subjectId",
                header: "Subject",
                render: (p) => subjectLabels[p.subjectId] ?? p.subjectId,
              },
              {
                key: "dependsOnId",
                header: "Prerequisite (depends on)",
                render: (p) => subjectLabels[p.dependsOnId] ?? p.dependsOnId,
              },
              ...(isAdmin
                ? [{
                    key: "id" as const,
                    header: "Actions",
                    render: (p: Prerequisite) => (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(p.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    ),
                  }]
                : []),
            ]}
          />
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add prerequisite</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject (requires)</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.code} – {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prerequisite (must complete)</Label>
              <Select value={dependsOnId} onValueChange={setDependsOnId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select prerequisite" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.code} – {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {addError && (
              <p className="text-sm text-destructive">{addError}</p>
            )}
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={loading}>
                {loading ? "Adding..." : "Add"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete prerequisite"
        description="Remove this prerequisite requirement?"
        confirmLabel="Delete"
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </>
  );
}
