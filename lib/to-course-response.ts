import type { CourseResponse, CourseKind } from "@/lib/api-types";

/** Prisma course row shape used by API mappers (subset of fields). */
export type CourseRowForApi = {
  Id: number;
  Name: string;
  Code: string;
  Description: string | null;
  Prerequisites: string[];
  Credits: number;
  LectureHours: number;
  LabHours: number;
  Status: string;
  ProgramId: number;
  ProgramSemesterId?: number | null;
  CourseKind?: string;
  ElectiveGroupId?: number | null;
  Program?: { Name: string } | null;
  ProgramSemester?: { Sequence: number } | null;
  ElectiveGroup?: { Id: number; Label: string | null; ChooseCount: number } | null;
  CreatedAt: Date;
  UpdatedAt: Date;
};

export function toCourseResponse(row: CourseRowForApi): CourseResponse {
  const eg = row.ElectiveGroup ?? null;
  return {
    id: row.Id,
    name: row.Name,
    code: row.Code,
    description: row.Description,
    prerequisites: row.Prerequisites,
    credits: row.Credits,
    lecture_hours: row.LectureHours,
    lab_hours: row.LabHours,
    status: row.Status as CourseResponse["status"],
    program_id: row.ProgramId,
    program_name: row.Program?.Name ?? "",
    program_semester_id: row.ProgramSemesterId ?? null,
    program_semester_sequence: row.ProgramSemester?.Sequence ?? null,
    course_kind: (row.CourseKind ?? "COMPULSORY") as CourseKind,
    elective_group_id: row.ElectiveGroupId ?? null,
    elective_group_label: eg?.Label ?? null,
    elective_choose_count: eg?.ChooseCount ?? null,
    created_at: row.CreatedAt.toISOString(),
    updated_at: row.UpdatedAt.toISOString(),
  };
}
