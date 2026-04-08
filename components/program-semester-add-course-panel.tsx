"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CourseResponse,
  ProgramResponse,
  CurriculumSemesterResponse,
} from "@/lib/api-types";
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

export type ProgramSemesterAddCoursePanelProps = {
  program: ProgramResponse;
  semester: CurriculumSemesterResponse;
  onReloadCurriculum: () => Promise<void>;
  /** When false, skips catalog refresh (e.g. dialog closed). */
  active?: boolean;
  /** Called after linking an existing course (e.g. close dialog). Panel also resets selection for another add. */
  onLinkedExistingSuccess?: () => void;
  /** Called after saving a new course (e.g. close dialog). */
  onNewCourseSaved?: () => void;
  /** Prefix for new-course form field ids. */
  fieldIdPrefix?: string;
};

export function ProgramSemesterAddCoursePanel({
  program,
  semester,
  onReloadCurriculum,
  active = true,
  onLinkedExistingSuccess,
  onNewCourseSaved,
  fieldIdPrefix,
}: ProgramSemesterAddCoursePanelProps) {
  const prefix = fieldIdPrefix ?? `add-${semester.id}`;

  const [mode, setMode] = useState<Mode>("existing");
  const [catalog, setCatalog] = useState<CourseResponse[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CourseResponse | null>(null);

  const [courseKind, setCourseKind] = useState<"COMPULSORY" | "ELECTIVE">("COMPULSORY");
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
    if (!active) return;
    void refreshCatalog();
  }, [active, refreshCatalog]);

  useEffect(() => {
    if (!active) return;
    setMode("existing");
    setSearch("");
    setSelected(null);
    setCourseKind("COMPULSORY");
    setFormError(null);
  }, [active, semester.id]);

  const filtered = useMemo(
    () => catalog.filter((c) => matchesCourseSearch(c, search)).slice(0, 80),
    [catalog, search]
  );

  const alreadyHere = useMemo(() => {
    if (!selected) return false;
    return selected.program_id === program.id && selected.program_semester_id === semester.id;
  }, [selected, program.id, semester.id]);

  const placementSummary = useCallback(
    (c: CourseResponse) => {
      if (c.program_id !== program.id) {
        return `Other program: ${c.program_name || "—"}`;
      }
      if (c.program_semester_sequence != null) {
        return `This program · Semester ${c.program_semester_sequence}`;
      }
      return "This program · not on timeline";
    },
    [program.id]
  );

  const handleLinkExisting = async () => {
    if (!selected || alreadyHere) return;
    setLinking(true);
    setFormError(null);
    try {
      const body: Record<string, unknown> = {
        program_id: program.id,
        program_semester_id: semester.id,
        course_kind: courseKind,
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
      setSelected(null);
      setSearch("");
      setFormError(null);
      onLinkedExistingSuccess?.();
    } catch {
      setFormError("Something went wrong");
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
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
            <FieldLabel htmlFor={`${prefix}-catalog-search`}>Search courses</FieldLabel>
            <Input
              id={`${prefix}-catalog-search`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type name, code, or program…"
              autoComplete="off"
            />
          </Field>

          <div className="border-input max-h-56 overflow-y-auto rounded-lg border">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground p-4 text-sm">No matches.</p>
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
          onReloadCurriculum={onReloadCurriculum}
          onSaved={onNewCourseSaved}
          fieldIdPrefix={prefix}
        />
      )}
    </div>
  );
}
