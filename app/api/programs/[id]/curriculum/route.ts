import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, notFound, internalError } from "@/lib/api-utils";
import type {
  ProgramCurriculumResponse,
  ProgramResponse,
  ProgramStatus,
} from "@/lib/api-types";
import { toCourseResponse } from "@/lib/to-course-response";
import { authorizeModuleRoute } from "@/lib/auth";
import { courseApiInclude } from "@/lib/course-api-include";
import { ensureProgramSemestersForDuration } from "@/lib/ensure-program-semesters";

function parseId(id: string): number | null {
  const n = parseInt(id, 10);
  return Number.isNaN(n) || n < 1 ? null : n;
}

function toProgramResponse(row: {
  Id: number;
  Name: string;
  Code: string;
  DurationYears: number;
  Status: string;
  DepartmentId: number;
  CreatedAt: Date;
  UpdatedAt: Date;
  Department?: { Name: string };
}): ProgramResponse {
  return {
    id: row.Id,
    name: row.Name,
    code: row.Code,
    duration_years: row.DurationYears,
    status: row.Status as ProgramStatus,
    department_id: row.DepartmentId,
    department_name: row.Department?.Name ?? "",
    created_at: row.CreatedAt.toISOString(),
    updated_at: row.UpdatedAt.toISOString(),
  };
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await authorizeModuleRoute(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Program not found");

  try {
    const base = await prisma.programs.findUnique({
      where: { Id: numericId },
      select: { Id: true, DurationYears: true },
    });
    if (!base) return notFound("Program not found");

    await ensureProgramSemestersForDuration(prisma, base.Id, base.DurationYears);

    const row = await prisma.programs.findUnique({
      where: { Id: numericId },
      include: {
        Department: { select: { Name: true } },
        ProgramSemesters: {
          orderBy: { Sequence: "asc" },
          include: {
            ElectiveGroups: { orderBy: { Id: "asc" } },
            Courses: {
              orderBy: [{ Code: "asc" }],
              include: courseApiInclude,
            },
          },
        },
      },
    });
    if (!row) return notFound("Program not found");

    const semesters = row.ProgramSemesters.map((sem) => {
      const elective_groups = sem.ElectiveGroups.map((g) => ({
        id: g.Id,
        choose_count: g.ChooseCount,
        label: g.Label,
        course_count: sem.Courses.filter((c) => c.ElectiveGroupId === g.Id).length,
      }));
      const courses = sem.Courses.map((c) => toCourseResponse(c));
      return {
        id: sem.Id,
        sequence: sem.Sequence,
        elective_groups,
        courses,
      };
    });

    const body: ProgramCurriculumResponse = {
      program: toProgramResponse(row),
      semesters,
    };
    return json(body);
  } catch {
    return internalError();
  }
}
