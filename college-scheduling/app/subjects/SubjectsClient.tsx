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
import { SubjectForm } from "@/components/forms/SubjectForm";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import type { Subject, Semester } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function SubjectsClient({
  initialData,
  semesterLabels,
  semesters: initialSemesters,
  semesterOptions,
}: {
  initialData: Subject[];
  semesterLabels: Record<string, string>;
  semesters: Semester[];
  semesterOptions: { value: string; label: string }[];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "Admin";
  const [data, setData] = useState<Subject[]>(initialData);
  const [semesters] = useState<Semester[]>(initialSemesters);
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    let list = data;
    if (semesterFilter && semesterFilter !== "all") {
      list = list.filter((s) => s.semesterId === semesterFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.code.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, search, semesterFilter]);

  const refresh = useCallback(() => {
    router.refresh();
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((list) => Array.isArray(list) && setData(list))
      .catch(() => {});
  }, [router]);

  async function handleUpdate(
    id: string,
    payload: {
      code: string;
      name: string;
      credits: number;
      lectureHours: number;
      labHours: number;
      semesterId: string;
    }
  ) {
    const res = await fetch(`/api/subjects/${id}`, {
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
    const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to delete");
    }
    setDeleteId(null);
    refresh();
  }

  const editing = editId ? data.find((s) => s.id === editId) : null;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Subjects</CardTitle>
          {isAdmin && (
            <Button asChild>
              <Link href="/subjects/create">
                <Plus className="mr-2 h-4 w-4" />
                Add subject
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchFilterBar
            searchPlaceholder="Search by code or name..."
            searchValue={search}
            onSearchChange={setSearch}
            filterLabel="Semester"
            filterValue={semesterFilter}
            filterOptions={semesterOptions}
            onFilterChange={setSemesterFilter}
            filterPlaceholder="All semesters"
          />
          <DataTable<Subject>
            data={filteredData}
            keyExtractor={(s) => s.id}
            columns={[
              { key: "code", header: "Code" },
              { key: "name", header: "Name" },
              { key: "credits", header: "Credits" },
              { key: "lectureHours", header: "Lec" },
              { key: "labHours", header: "Lab" },
              {
                key: "semesterId",
                header: "Semester",
                render: (s) => semesterLabels[s.semesterId] ?? s.semesterId,
              },
              ...(isAdmin
                ? [{
                    key: "id" as const,
                    header: "Actions",
                    render: (s: Subject) => (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditId(s.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(s.id)}
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
            <DialogTitle>Edit subject</DialogTitle>
          </DialogHeader>
          {editing && (
            <SubjectForm
              semesters={semesters}
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
        title="Delete subject"
        description="This will delete the subject and its prerequisites. Are you sure?"
        confirmLabel="Delete"
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </>
  );
}
