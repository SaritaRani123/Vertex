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
import { DepartmentForm } from "@/components/forms/DepartmentForm";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import type { Department } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function DepartmentsClient({ initialData }: { initialData: Department[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "Admin";
  const [data, setData] = useState<Department[]>(initialData);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.trim().toLowerCase();
    return data.filter((d) => d.name.toLowerCase().includes(q));
  }, [data, search]);

  const refresh = useCallback(() => {
    router.refresh();
    fetch("/api/departments")
      .then((r) => r.json())
      .then((list) => Array.isArray(list) && setData(list))
      .catch(() => {});
  }, [router]);

  async function handleUpdate(id: string, payload: { name: string }) {
    const res = await fetch(`/api/departments/${id}`, {
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
    const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to delete");
    }
    setDeleteId(null);
    refresh();
  }

  const editing = editId ? data.find((d) => d.id === editId) : null;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Departments</CardTitle>
          {isAdmin && (
            <Button asChild>
              <Link href="/departments/create">
                <Plus className="mr-2 h-4 w-4" />
                Add department
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchFilterBar
            searchPlaceholder="Search by name..."
            searchValue={search}
            onSearchChange={setSearch}
          />
          <DataTable<Department>
            data={filteredData}
            keyExtractor={(d) => d.id}
            columns={[
              { key: "name", header: "Name" },
              ...(isAdmin
                ? [{
                    key: "id" as const,
                    header: "Actions",
                    render: (d: Department) => (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditId(d.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(d.id)}
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
            <DialogTitle>Edit department</DialogTitle>
          </DialogHeader>
          {editing && (
            <DepartmentForm
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
        title="Delete department"
        description="This will delete the department and all its programs. Are you sure?"
        confirmLabel="Delete"
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </>
  );
}
