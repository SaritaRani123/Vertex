"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProgramCurriculumResponse, ProgramResponse } from "@/lib/api-types";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ProgramSemesterCourseForm } from "@/components/program-semester-course-form";

type ProgramCurriculumWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: ProgramResponse | null;
  onFinished: () => void;
};

/** Step through semesters and add courses using the same form as Create course + curriculum placement. */
export function ProgramCurriculumWizard({
  open,
  onOpenChange,
  program,
  onFinished,
}: ProgramCurriculumWizardProps) {
  const [curriculum, setCurriculum] = useState<ProgramCurriculumResponse | null>(null);
  const [step, setStep] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCurriculum = useCallback(async () => {
    if (!program) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/programs/${program.id}/curriculum`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setLoadError(data?.error ?? "Failed to load curriculum");
        setCurriculum(null);
        return;
      }
      setCurriculum(data as ProgramCurriculumResponse);
      setStep(0);
    } catch {
      setLoadError("Something went wrong");
      setCurriculum(null);
    } finally {
      setLoading(false);
    }
  }, [program]);

  useEffect(() => {
    if (open && program) {
      void loadCurriculum();
    }
  }, [open, program, loadCurriculum]);

  const semesters = curriculum?.semesters ?? [];
  const current = semesters[step];
  const totalSteps = semesters.length;

  const handleFinish = () => {
    onOpenChange(false);
    onFinished();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>Set up curriculum</DialogTitle>
          <DialogDescription>
            Add courses for each semester. The form matches <strong>Create course</strong>, plus curriculum type and
            elective pools for this semester.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {program ? (
            <p className="text-muted-foreground mb-4 text-sm">
              Program: <span className="text-foreground font-medium">{program.name}</span>{" "}
              <span className="text-muted-foreground">({program.code})</span>
            </p>
          ) : null}

          {loading ? (
            <p className="text-muted-foreground text-sm">Loading semesters…</p>
          ) : loadError ? (
            <p className="text-destructive text-sm">{loadError}</p>
          ) : totalSteps === 0 ? (
            <p className="text-muted-foreground text-sm">
              No curriculum semesters were found for this program. Try creating a new program with a duration in years
              (each year adds two semesters).
            </p>
          ) : current && program ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  Step {step + 1} of {totalSteps}
                </span>
                <Badge variant="secondary">Semester {current.sequence}</Badge>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Courses in this semester</h3>
                {current.courses.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No courses yet. Add the first one below.</p>
                ) : (
                  <ul className="border-border divide-border divide-y rounded-lg border text-sm">
                    {current.courses.map((c) => (
                      <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                        <span>
                          <span className="font-medium">{c.name}</span>{" "}
                          <span className="text-muted-foreground">({c.code})</span> — {c.credits} cr
                        </span>
                        <span className="flex items-center gap-2">
                          <Badge variant={c.course_kind === "ELECTIVE" ? "outline" : "default"}>
                            {c.course_kind === "ELECTIVE" ? "Elective" : "Compulsory"}
                          </Badge>
                          {c.elective_group_id != null ? (
                            <span className="text-muted-foreground text-xs">Pool #{c.elective_group_id}</span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Separator />

              <ProgramSemesterCourseForm
                key={current.id}
                program={program}
                semesterId={current.id}
                electiveGroups={current.elective_groups}
                onReloadCurriculum={loadCurriculum}
                fieldIdPrefix={`cw-${current.id}`}
              />
            </div>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={step <= 0 || loading} onClick={() => setStep((s) => Math.max(0, s - 1))}>
            Back
          </Button>
          {current && step < totalSteps - 1 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)}>
              Next semester
            </Button>
          ) : (
            <Button type="button" disabled={loading || totalSteps === 0} onClick={handleFinish}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
