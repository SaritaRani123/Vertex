"use client";

import type { ProgramResponse, CurriculumSemesterResponse } from "@/lib/api-types";
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
import { ProgramSemesterAddCoursePanel } from "@/components/program-semester-add-course-panel";

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
          <ProgramSemesterAddCoursePanel
            key={semester.id}
            active={open}
            program={program}
            semester={semester}
            onReloadCurriculum={onReloadCurriculum}
            fieldIdPrefix={`add-${semester.id}`}
            onLinkedExistingSuccess={() => onOpenChange(false)}
            onNewCourseSaved={() => onOpenChange(false)}
          />
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
