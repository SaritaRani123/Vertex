import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, fromZodError, internalError, validationError } from "@/lib/api-utils";
import type { CourseListResponse } from "@/lib/api-types";
import { safeValidateCourseCreate } from "@/lib/validations/courses";
import { authorizeCoursesApi } from "@/lib/auth";
import { toCourseResponse } from "@/lib/to-course-response";
import { courseApiInclude } from "@/lib/course-api-include";

export async function GET(request: NextRequest) {
  const auth = await authorizeCoursesApi(request);
  if ("response" in auth) return auth.response;
  try {
    const list = await prisma.courses.findMany({
      orderBy: [{ Code: "asc" }, { Name: "asc" }],
      include: courseApiInclude,
    });
    const data: CourseListResponse = {
      data: list.map(toCourseResponse),
    };
    return json(data);
  } catch {
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  const auth = await authorizeCoursesApi(request);
  if ("response" in auth) return auth.response;
  try {
    const body = await request.json();
    const parsed = safeValidateCourseCreate(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    let programId: number;
    const programSemesterId = parsed.data.program_semester_id ?? null;

    if (parsed.data.program_semester_id != null) {
      const sem = await prisma.programSemesters.findUnique({
        where: { Id: parsed.data.program_semester_id },
        select: { Id: true, ProgramId: true },
      });
      if (!sem) {
        return validationError("Program semester not found");
      }
      programId = sem.ProgramId;
      if (parsed.data.program_id != null && parsed.data.program_id !== programId) {
        return validationError("program_id does not match this curriculum semester");
      }
    } else {
      if (parsed.data.program_id == null) {
        return validationError("Program not found");
      }
      programId = parsed.data.program_id;
      const program = await prisma.programs.findUnique({ where: { Id: programId } });
      if (!program) {
        return validationError("Program not found");
      }
    }

    if (parsed.data.elective_group_id != null) {
      const g = await prisma.electiveGroups.findUnique({
        where: { Id: parsed.data.elective_group_id },
        select: { Id: true, ProgramSemesterId: true },
      });
      if (!g) {
        return validationError("Elective group not found");
      }
      if (g.ProgramSemesterId !== parsed.data.program_semester_id) {
        return validationError("Elective group does not belong to this semester");
      }
    }

    const existingCode = await prisma.courses.findUnique({
      where: { Code: parsed.data.code },
    });
    if (existingCode) {
      return validationError("A course with this code already exists");
    }

    const lectureHours = parsed.data.lecture_hours ?? 0;
    const labHours = parsed.data.lab_hours ?? 0;
    const courseKind = parsed.data.course_kind ?? "COMPULSORY";
    const electiveGroupId =
      courseKind === "ELECTIVE" ? (parsed.data.elective_group_id ?? null) : null;

    const created = await prisma.courses.create({
      data: {
        Name: parsed.data.name,
        Code: parsed.data.code,
        Description: parsed.data.description ?? null,
        Prerequisites: parsed.data.prerequisites ?? [],
        Credits: parsed.data.credits,
        LectureHours: lectureHours,
        LabHours: labHours,
        Status: parsed.data.status ?? "ACTIVE",
        ProgramId: programId,
        ProgramSemesterId: programSemesterId,
        CourseKind: courseKind,
        ElectiveGroupId: electiveGroupId,
      },
      include: courseApiInclude,
    });

    return json(toCourseResponse(created), 201);
  } catch {
    return internalError();
  }
}
