"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
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
import { DataTable } from "@/components/tables/DataTable";
import { ProgramForm } from "@/components/forms/ProgramForm";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import type { Program, Department } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function ProgramsClient({
  initialData,
  departments,
  departmentNames,
}: {
  initialData: Program[];
  departments: Department[];
  departmentNames: Record<string, string>;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "Admin";
  const [data, setData] = useState<Program[]>(initialData);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    let list = data;
    if (departmentFilter && departmentFilter !== "all") {
      list = list.filter((p) => p.departmentId === departmentFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.degreeType.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, search, departmentFilter]);

  const refresh = useCallback(() => {
    router.refresh();
    fetch("/api/programs")
      .then((r) => r.json())
      .then((list) => Array.isArray(list) && setData(list))
      .catch(() => {});
  }, [router]);

  async function handleUpdate(
    id: string,
    payload: {
      name: string;
      duration: number;
      degreeType: string;
      totalCredits: number;
      departmentId: string;
    }
  ) {
    const res = await fetch(`/api/programs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? "Failed to update");
    setEditId(null);
    refresh();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/programs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to delete");
    }
    setDeleteId(null);
    refresh();
  }

  const editing = editId ? data.find((p) => p.id === editId) : null;
  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Programs</CardTitle>
          {isAdmin && (
            <Button asChild>
              <Link href="/programs/create">
                <Plus className="mr-2 h-4 w-4" />
                Add program
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchFilterBar
            searchPlaceholder="Search by name or degree..."
            searchValue={search}
            onSearchChange={setSearch}
            filterLabel="Department"
            filterValue={departmentFilter}
            filterOptions={departmentOptions}
            onFilterChange={setDepartmentFilter}
            filterPlaceholder="All departments"
          />
          <DataTable<Program>
            data={filteredData}
            keyExtractor={(p) => p.id}
            columns={[
              { key: "name", header: "Name" },
              { key: "degreeType", header: "Degree" },
              { key: "duration", header: "Duration (y)" },
              { key: "totalCredits", header: "Credits" },
              {
                key: "departmentId",
                header: "Department",
                render: (p) => departmentNames[p.departmentId] ?? p.departmentId,
              },
              ...(isAdmin
                ? [{
                    key: "id" as const,
                    header: "Actions",
                    render: (p: Program) => (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditId(p.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(p.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ),
                  }]
                : []),
            ]}
          />
        </CardContent>
      </Card>

      <Dialog open={!!editId} onOpenChange={(o) => !o && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit program</DialogTitle>
          </DialogHeader>
          {editing && (
            <ProgramForm
              departments={departments}
              initial={editing}
              onSubmit={(p) => handleUpdate(editing.id, p)}
              onCancel={() => setEditId(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete program"
        description="This will delete the program and all its semesters and subjects. Are you sure?"
        confirmLabel="Delete"
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </>
  );
}
