"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CourseResponse, ProgramResponse, CurriculumSemesterResponse } from "@/lib/api-types";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ProgramSemesterCourseForm } from "@/components/program-semester-course-form";

type Mode = "existing" | "new";

function matchesCourseSearch(c: CourseResponse, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return (
    c.name.toLowerCase().includes(s) ||
    c.code.toLowerCase().includes(s) ||
    (c.program_name ?? "").toLowerCase().includes(s)
  );
}

type AddProgramCourseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: ProgramResponse;
  semester: CurriculumSemesterResponse;
  onReloadCurriculum: () => Promise<void>;
};

export function AddProgramCourseDialog({
  open,
  onOpenChange,
  program,
  semester,
  onReloadCurriculum,
}: AddProgramCourseDialogProps) {
  const [mode, setMode] = useState<Mode>("existing");
  const [catalog, setCatalog] = useState<CourseResponse[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CourseResponse | null>(null);

  const [courseKind, setCourseKind] = useState<"COMPULSORY" | "ELECTIVE">("COMPULSORY");
  const [electiveGroupId, setElectiveGroupId] = useState<string>("");
  const [poolChooseInput, setPoolChooseInput] = useState("2");
  const [newPoolLabel, setNewPoolLabel] = useState("");
  const [creatingPool, setCreatingPool] = useState(false);
  const [linking, setLinking] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const refreshCatalog = useCallback(async () => {
    try {
      const res = await fetch("/api/courses");
      if (!res.ok) return;
      const json = await res.json();
      setCatalog(json.data ?? []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void refreshCatalog();
  }, [open, refreshCatalog]);

  useEffect(() => {
    if (!open) return;
    setMode("existing");
    setSearch("");
    setSelected(null);
    setCourseKind("COMPULSORY");
    setElectiveGroupId("");
    setPoolChooseInput("2");
    setNewPoolLabel("");
    setFormError(null);
  }, [open, semester.id]);

  const filtered = useMemo(
    () => catalog.filter((c) => matchesCourseSearch(c, search)).slice(0, 80),
    [catalog, search]
  );

  const alreadyHere = useMemo(() => {
    if (!selected) return false;
    return selected.program_id === program.id && selected.program_semester_id === semester.id;
  }, [selected, program.id, semester.id]);

  const placementSummary = useCallback((c: CourseResponse) => {
    if (c.program_id !== program.id) {
      return `Other program: ${c.program_name || "—"}`;
    }
    if (c.program_semester_sequence != null) {
      return `This program · Semester ${c.program_semester_sequence}`;
    }
    return "This program · not on timeline";
  }, [program.id]);

  const handleCreatePool = async () => {
    const chooseParsed = parseInt(poolChooseInput.trim(), 10);
    if (poolChooseInput.trim() === "" || Number.isNaN(chooseParsed) || chooseParsed < 1) {
      setFormError("Enter how many courses to choose from the pool (at least 1).");
      return;
    }
    setCreatingPool(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/program-semesters/${semester.id}/elective-groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          choose_count: chooseParsed,
          label: newPoolLabel.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data?.error ?? "Could not create pool");
        return;
      }
      setElectiveGroupId(String(data.id));
      setNewPoolLabel("");
      await onReloadCurriculum();
    } catch {
      setFormError("Something went wrong");
    } finally {
      setCreatingPool(false);
    }
  };

  const handleLinkExisting = async () => {
    if (!selected || alreadyHere) return;
    if (courseKind === "ELECTIVE" && electiveGroupId) {
      const gid = Number(electiveGroupId);
      const g = semester.elective_groups.find((x) => x.id === gid);
      if (!g) {
        setFormError("Select a valid elective pool");
        return;
      }
    }
    setLinking(true);
    setFormError(null);
    try {
      const body: Record<string, unknown> = {
        program_id: program.id,
        program_semester_id: semester.id,
        course_kind: courseKind,
        elective_group_id:
          courseKind === "ELECTIVE" && electiveGroupId ? Number(electiveGroupId) : null,
      };
      const res = await fetch(`/api/courses/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data?.error ?? "Could not add course to this semester");
        return;
      }
      await onReloadCurriculum();
      await refreshCatalog();
      onOpenChange(false);
    } catch {
      setFormError("Something went wrong");
    } finally {
      setLinking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>Add course · Semester {semester.sequence}</DialogTitle>
          <DialogDescription>
            Search the catalog to link an existing course, or create a new one with the same form as elsewhere.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === "existing" ? "default" : "outline"}
              onClick={() => setMode("existing")}
            >
              Existing course
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "new" ? "default" : "outline"}
              onClick={() => setMode("new")}
            >
              New course
            </Button>
          </div>

          {mode === "existing" ? (
            <div className="space-y-4">
              <Field>
                <FieldLabel htmlFor="add-course-search">Search courses</FieldLabel>
                <Input
                  id="add-course-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type name, code, or program…"
                  autoComplete="off"
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  Partial match on course name, code, or program name. Select a row, set type/pool if needed, then add.
                </p>
              </Field>

              <div className="border-input max-h-56 overflow-y-auto rounded-lg border">
                {filtered.length === 0 ? (
                  <p className="text-muted-foreground p-4 text-sm">No matches. Try another search or create new.</p>
                ) : (
                  <ul className="divide-border divide-y">
                    {filtered.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(c);
                            setFormError(null);
                          }}
                          className={cn(
                            "hover:bg-muted/50 flex w-full flex-col gap-0.5 px-3 py-2.5 text-left text-sm transition-colors",
                            selected?.id === c.id && "bg-primary/10"
                          )}
                        >
                          <span className="font-medium">
                            {c.name}{" "}
                            <span className="text-muted-foreground font-mono text-xs uppercase">({c.code})</span>
                          </span>
                          <span className="text-muted-foreground text-xs">{placementSummary(c)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {selected ? (
                <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                  <p className="text-sm font-medium">Selected</p>
                  <p className="text-sm">
                    {selected.name}{" "}
                    <Badge variant="outline" className="ml-1 font-mono uppercase">
                      {selected.code}
                    </Badge>
                  </p>
                  {alreadyHere ? (
                    <p className="text-amber-700 text-sm dark:text-amber-400">
                      This course is already placed in this semester.
                    </p>
                  ) : (
                    <>
                      <FieldGroup>
                        <Field>
                          <FieldLabel>Course type</FieldLabel>
                          <Select
                            value={courseKind}
                            onValueChange={(v) => {
                              if (v === "COMPULSORY" || v === "ELECTIVE") {
                                setCourseKind(v);
                                if (v === "COMPULSORY") setElectiveGroupId("");
                              }
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="COMPULSORY">Compulsory</SelectItem>
                              <SelectItem value="ELECTIVE">Elective</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      </FieldGroup>
                      {courseKind === "ELECTIVE" ? (
                        <div className="bg-muted/40 space-y-3 rounded-md border p-3">
                          <p className="text-xs font-medium">Elective pool (optional)</p>
                          {semester.elective_groups.length > 0 ? (
                            <Field>
                              <FieldLabel>Pool</FieldLabel>
                              <Select
                                value={electiveGroupId || "__none__"}
                                onValueChange={(v) => setElectiveGroupId(v === "__none__" || v == null ? "" : v)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="No pool" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">No pool</SelectItem>
                                  {semester.elective_groups.map((g) => (
                                    <SelectItem key={g.id} value={String(g.id)}>
                                      {g.label ?? `Pool ${g.id}`} — choose {g.choose_count}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </Field>
                          ) : null}
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Input
                              inputMode="numeric"
                              value={poolChooseInput}
                              onChange={(e) => setPoolChooseInput(e.target.value.replace(/[^\d]/g, ""))}
                              placeholder="Choose N"
                              aria-label="Pool choose count"
                            />
                            <Input
                              value={newPoolLabel}
                              onChange={(e) => setNewPoolLabel(e.target.value)}
                              placeholder="Pool label (optional)"
                            />
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={creatingPool}
                            onClick={() => void handleCreatePool()}
                          >
                            {creatingPool ? "Creating…" : "Create pool"}
                          </Button>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              ) : null}

              {formError ? <p className="text-destructive text-sm">{formError}</p> : null}

              <Button
                type="button"
                disabled={!selected || alreadyHere || linking}
                onClick={() => void handleLinkExisting()}
              >
                {linking ? "Adding…" : `Add to semester ${semester.sequence}`}
              </Button>
            </div>
          ) : (
            <ProgramSemesterCourseForm
              program={program}
              semesterId={semester.id}
              electiveGroups={semester.elective_groups}
              onReloadCurriculum={onReloadCurriculum}
              onSaved={() => onOpenChange(false)}
              fieldIdPrefix={`add-${semester.id}`}
            />
          )}
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
