"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type {
  CourseResponse,
  CurriculumSemesterResponse,
  ProgramCurriculumResponse,
  ProgramResponse,
} from "@/lib/api-types";
import { useStaffActionGuard } from "@/hooks/use-staff-action-guard";
import { AddProgramCourseDialog } from "@/components/add-program-course-dialog";

function flattenProgramCourses(semesters: CurriculumSemesterResponse[]): CourseResponse[] {
  return semesters.flatMap((s) => s.courses);
}

function dependentsInProgram(
  courseCode: string,
  courseId: number,
  all: CourseResponse[]
): CourseResponse[] {
  return all.filter(
    (c) => c.id !== courseId && (c.prerequisites ?? []).includes(courseCode)
  );
}

export default function ProgramDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [program, setProgram] = useState<ProgramResponse | null>(null);
  const [curriculum, setCurriculum] = useState<ProgramCurriculumResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const [expandedSemesterIds, setExpandedSemesterIds] = useState<Record<number, boolean>>({});
  const didInitExpand = useRef(false);

  const [movingCourseId, setMovingCourseId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
    code: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addCourseSemester, setAddCourseSemester] = useState<CurriculumSemesterResponse | null>(null);
  const [semesterPages, setSemesterPages] = useState<Record<number, number>>({});
  const semesterPageSize = 8;

  const { guardAction, blockedDialog, sessionLoading } = useStaffActionGuard();

  const reloadData = useCallback(async () => {
    if (!id) return;
    try {
      const [progRes, currRes] = await Promise.all([
        fetch(`/api/programs/${id}`),
        fetch(`/api/programs/${id}/curriculum`),
      ]);
      if (!progRes.ok) return;
      const progJson = (await progRes.json()) as ProgramResponse;
      if (currRes.ok) {
        const currJson = (await currRes.json()) as ProgramCurriculumResponse;
        if (!progJson.department_name?.trim() && currJson.program?.department_name?.trim()) {
          progJson.department_name = currJson.program.department_name;
        }
        setCurriculum(currJson);
      } else {
        setCurriculum(null);
      }
      setProgram(progJson);
    } catch {
      setPageError("Could not refresh curriculum.");
    }
  }, [id]);

  useEffect(() => {
    didInitExpand.current = false;
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [progRes, currRes] = await Promise.all([
          fetch(`/api/programs/${id}`),
          fetch(`/api/programs/${id}/curriculum`),
        ]);
        if (cancelled) return;
        if (!progRes.ok) {
          setError(progRes.status === 404 ? "Program not found." : "Failed to load program.");
          setProgram(null);
          setCurriculum(null);
          return;
        }
        const progJson = (await progRes.json()) as ProgramResponse;
        if (currRes.ok) {
          const currJson = (await currRes.json()) as ProgramCurriculumResponse;
          if (!progJson.department_name?.trim() && currJson.program?.department_name?.trim()) {
            progJson.department_name = currJson.program.department_name;
          }
          setCurriculum(currJson);
        } else {
          setCurriculum(null);
        }
        setProgram(progJson);
      } catch {
        if (!cancelled) setError("Something went wrong.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const semesters = curriculum?.semesters ?? [];
  /** Fresh semester from curriculum so new elective pools appear after reload (dialog was holding a stale snapshot). */
  const addCourseSemesterLive = useMemo(() => {
    if (!addCourseSemester || !curriculum?.semesters?.length) return addCourseSemester;
    return curriculum.semesters.find((s) => s.id === addCourseSemester.id) ?? addCourseSemester;
  }, [curriculum, addCourseSemester]);

  const totalCourses = semesters.reduce((n, s) => n + s.courses.length, 0);
  const allProgramCourses = useMemo(() => flattenProgramCourses(semesters), [semesters]);

  useEffect(() => {
    setSemesterPages((prev) => {
      const next: Record<number, number> = {};
      let changed = false;

      for (const sem of semesters) {
        const totalPages = Math.max(1, Math.ceil(sem.courses.length / semesterPageSize));
        const previous = prev[sem.id] ?? 1;
        const clamped = Math.min(Math.max(previous, 1), totalPages);
        next[sem.id] = clamped;
        if (clamped !== previous) changed = true;
      }

      if (Object.keys(prev).length !== Object.keys(next).length) {
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [semesters]);

  useEffect(() => {
    if (!curriculum?.semesters?.length) return;
    if (didInitExpand.current) return;
    didInitExpand.current = true;
    setExpandedSemesterIds({ [curriculum.semesters[0].id]: true });
  }, [curriculum]);

  const toggleSemester = useCallback((semesterId: number) => {
    setExpandedSemesterIds((prev) => ({ ...prev, [semesterId]: !prev[semesterId] }));
  }, []);

  const handleMoveSemester = async (course: CourseResponse, newSemesterIdStr: string | null) => {
    if (!program || newSemesterIdStr == null) return;
    const currentId = course.program_semester_id;
    if (newSemesterIdStr === "__none__") {
      if (currentId == null) return;
    } else {
      const newId = parseInt(newSemesterIdStr, 10);
      if (Number.isNaN(newId) || newId === currentId) return;
    }

    setMovingCourseId(course.id);
    setPageError(null);
    try {
      const body: Record<string, unknown> = {
        elective_group_id: null,
      };
      if (newSemesterIdStr === "__none__") {
        body.program_semester_id = null;
      } else {
        body.program_semester_id = parseInt(newSemesterIdStr, 10);
      }
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPageError(data?.error ?? "Could not move course");
        return;
      }
      await reloadData();
    } catch {
      setPageError("Could not move course");
    } finally {
      setMovingCourseId(null);
    }
  };

  const deleteDependents = useMemo(() => {
    if (!deleteTarget) return [];
    return dependentsInProgram(deleteTarget.code, deleteTarget.id, allProgramCourses);
  }, [deleteTarget, allProgramCourses]);

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    setIsDeleting(true);
    setPageError(null);
    try {
      const res = await fetch(`/api/courses/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPageError(data?.error ?? "Failed to delete course");
        setIsDeleting(false);
        return;
      }
      setDeleteTarget(null);
      await reloadData();
    } catch {
      setPageError("Failed to delete course");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground p-6">Loading program…</p>;
  }

  if (error || !program) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-destructive">{error ?? "Program not found."}</p>
        <Button variant="outline" asChild>
          <Link href="/programs">Back to programs</Link>
        </Button>
      </div>
    );
  }

  const returnToProgram = `/programs/${program.id}`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-2">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/programs" aria-label="Back to programs">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{program.name}</h1>
            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-1 text-sm">
              <Button variant="link" className="h-auto p-0 font-medium text-foreground underline-offset-4 hover:text-primary" asChild>
                <Link href={`/programs?department_id=${program.department_id}`}>
                  {program.department_name?.trim() || "View department programs"}
                </Link>
              </Button>
              <span className="text-muted-foreground">· Program code </span>
              <span className="text-foreground font-mono font-medium uppercase">{program.code}</span>
              <span className="text-muted-foreground">
                · {program.duration_years} year{program.duration_years === 1 ? "" : "s"} (
                {program.duration_years * 2} semesters)
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" className="shrink-0 gap-2" asChild>
          <Link href={`/programs/${program.id}/edit`}>
            <Pencil className="size-4" />
            Edit program
          </Link>
        </Button>
      </div>

      {pageError ? <p className="text-destructive text-sm">{pageError}</p> : null}

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Curriculum by semester</CardTitle>
          {semesters.length > 0 ? (
            <div className="pt-2">
              <p className="text-foreground text-sm font-medium">
                Total courses in this program:{" "}
                <span className="text-foreground text-base font-bold tabular-nums">{totalCourses}</span>
              </p>
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          {semesters.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No semesters returned for this program. Refresh the page; if this persists, check that duration (years) is
              set and try editing the program to save again.
            </p>
          ) : (
            semesters.map((sem) => {
              const isOpen = !!expandedSemesterIds[sem.id];
              const currentPage = semesterPages[sem.id] ?? 1;
              const totalPages = Math.max(1, Math.ceil(sem.courses.length / semesterPageSize));
              const start = (currentPage - 1) * semesterPageSize;
              const paginatedCourses = sem.courses.slice(start, start + semesterPageSize);
              return (
                <section key={sem.id} className="rounded-xl border border-border bg-card">
                  <button
                    type="button"
                    onClick={() => toggleSemester(sem.id)}
                    className="hover:bg-muted/50 flex w-full items-center gap-3 rounded-t-xl px-4 py-3 text-left transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span
                      className="bg-accent/70 text-accent-foreground flex size-8 shrink-0 items-center justify-center rounded-md"
                      aria-hidden
                    >
                      {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-base font-semibold">Semester {sem.sequence}</span>
                      <span className="text-muted-foreground ml-2 text-sm font-normal">
                        {sem.courses.length} course{sem.courses.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {sem.courses.length}
                    </Badge>
                  </button>
                  {isOpen ? (
                    <div className="border-border space-y-3 border-t px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="gap-1.5"
                          disabled={sessionLoading}
                          onClick={() => guardAction(() => setAddCourseSemester(sem))}
                        >
                          <Plus className="size-4" />
                          Add course
                        </Button>
                      </div>
                      {sem.courses.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No courses in this semester yet.</p>
                      ) : (
                        <>
                          <div className="overflow-x-auto rounded-lg border">
                            <Table className="text-[0.95rem]">
                            <TableHeader>
                              <TableRow className="bg-muted/40">
                                <TableHead className="font-semibold">Code</TableHead>
                                <TableHead className="font-semibold">Name</TableHead>
                                <TableHead className="font-semibold">Credits</TableHead>
                                <TableHead className="font-semibold">Lecture</TableHead>
                                <TableHead className="font-semibold">Lab</TableHead>
                                <TableHead className="font-semibold">Type</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="min-w-[160px] font-semibold">Semester</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginatedCourses.map((c) => (
                                <TableRow key={c.id}>
                                  <TableCell className="font-mono text-sm font-medium uppercase">{c.code}</TableCell>
                                  <TableCell>
                                    <Link
                                      href={`/courses/${c.id}`}
                                      className="font-medium text-foreground hover:text-primary hover:underline underline-offset-4"
                                    >
                                      {c.name}
                                    </Link>
                                  </TableCell>
                                  <TableCell>{c.credits}</TableCell>
                                  <TableCell>{c.lecture_hours}h</TableCell>
                                  <TableCell>{c.lab_hours}h</TableCell>
                                  <TableCell>
                                    <Badge variant={c.course_kind === "ELECTIVE" ? "outline" : "default"}>
                                      {c.course_kind === "ELECTIVE" ? "Elective" : "Compulsory"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm font-medium">{c.status}</span>
                                  </TableCell>
                                  <TableCell onClick={(e) => e.stopPropagation()}>
                                    <Select
                                      disabled={movingCourseId === c.id || sessionLoading}
                                      value={
                                        c.program_semester_id != null
                                          ? String(c.program_semester_id)
                                          : "__none__"
                                      }
                                      onValueChange={(v) => {
                                        if (v != null) void handleMoveSemester(c, v);
                                      }}
                                    >
                                      <SelectTrigger className="h-9 min-w-[9.5rem] max-w-[11rem]" aria-label="Move to semester">
                                        <SelectValue placeholder="Semester">
                                          {(val) => {
                                            if (val == null || val === "__none__") return "Not on timeline";
                                            const sid = Number(val);
                                            const sem = semesters.find((s) => s.id === sid);
                                            return sem ? `Semester ${sem.sequence}` : "Semester";
                                          }}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="__none__">Not on timeline</SelectItem>
                                        {semesters.map((s) => (
                                          <SelectItem key={s.id} value={String(s.id)}>
                                            Semester {s.sequence}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex flex-wrap items-center justify-end gap-1">
                                      <Button variant="outline" size="sm" className="h-8" asChild>
                                        <Link
                                          href={`/courses/${c.id}/edit?returnTo=${encodeURIComponent(returnToProgram)}`}
                                        >
                                          Edit
                                        </Link>
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:text-destructive h-8"
                                        disabled={sessionLoading}
                                        onClick={() =>
                                          guardAction(() =>
                                            setDeleteTarget({ id: c.id, name: c.name, code: c.code })
                                          )
                                        }
                                        aria-label={`Delete ${c.name}`}
                                      >
                                        <Trash2 className="size-3.5" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                            </Table>
                          </div>
                          <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Showing {(currentPage - 1) * semesterPageSize + 1}-
                            {Math.min(currentPage * semesterPageSize, sem.courses.length)} of {sem.courses.length}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSemesterPages((prev) => ({
                                  ...prev,
                                  [sem.id]: Math.max(1, (prev[sem.id] ?? 1) - 1),
                                }))
                              }
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Page {currentPage} of {totalPages}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSemesterPages((prev) => ({
                                  ...prev,
                                  [sem.id]: Math.min(totalPages, (prev[sem.id] ?? 1) + 1),
                                }))
                              }
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </Button>
                          </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : null}
                </section>
              );
            })
          )}
        </CardContent>
      </Card>

      {program && addCourseSemesterLive ? (
        <AddProgramCourseDialog
          open
          onOpenChange={(open) => {
            if (!open) setAddCourseSemester(null);
          }}
          program={program}
          semester={addCourseSemesterLive}
          onReloadCurriculum={reloadData}
        />
      ) : null}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete course?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes <strong>{deleteTarget?.name}</strong> from the catalog. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteDependents.length > 0 && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2">
              <p className="text-sm font-medium text-destructive">
                This course is listed as a prerequisite for {deleteDependents.length} other course
                {deleteDependents.length === 1 ? "" : "s"} in this program:
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {deleteDependents.map((d) => (
                  <li key={d.id}>
                    {d.name} <span className="text-muted-foreground">({d.code})</span>
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground text-xs">
                Those prerequisites will be cleaned automatically when you confirm.
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {blockedDialog}
    </div>
  );
}
