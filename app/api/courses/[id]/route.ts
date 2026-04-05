import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, notFound, fromZodError, internalError, validationError } from "@/lib/api-utils";
import { safeValidateCourseUpdate } from "@/lib/validations/courses";
import { authorizeModuleRoute } from "@/lib/auth";
import { toCourseResponse } from "@/lib/to-course-response";
import { courseApiInclude } from "@/lib/course-api-include";

function parseId(id: string): number | null {
  const n = parseInt(id, 10);
  return Number.isNaN(n) || n < 1 ? null : n;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await authorizeModuleRoute(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Course not found");

  try {
    const row = await prisma.courses.findUnique({
      where: { Id: numericId },
      include: courseApiInclude,
    });
    if (!row) return notFound("Course not found");
    return json(toCourseResponse(row));
  } catch {
    return internalError();
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await authorizeModuleRoute(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Course not found");

  try {
    const row = await prisma.courses.findUnique({
      where: { Id: numericId },
      include: courseApiInclude,
    });
    if (!row) return notFound("Course not found");

    const body = await request.json();
    const parsed = safeValidateCourseUpdate(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    if (Object.keys(parsed.data).length === 0) {
      return json(toCourseResponse(row));
    }

    const nextProgramId = parsed.data.program_id ?? row.ProgramId;

    if (parsed.data.program_id !== undefined) {
      const program = await prisma.programs.findUnique({ where: { Id: parsed.data.program_id } });
      if (!program) return validationError("Program not found");
    }

    if (parsed.data.program_semester_id !== undefined) {
      if (parsed.data.program_semester_id !== null) {
        const sem = await prisma.programSemesters.findUnique({
          where: { Id: parsed.data.program_semester_id },
          select: { ProgramId: true },
        });
        if (!sem || sem.ProgramId !== nextProgramId) {
          return validationError("Semester does not belong to this course's program");
        }
      }
    }

    const effectiveSemesterId =
      parsed.data.program_semester_id !== undefined
        ? parsed.data.program_semester_id
        : row.ProgramSemesterId;

    if (parsed.data.elective_group_id != null) {
      if (effectiveSemesterId == null) {
        return validationError("Assign a curriculum semester before linking an elective pool");
      }
      const g = await prisma.electiveGroups.findUnique({
        where: { Id: parsed.data.elective_group_id },
        select: { ProgramSemesterId: true },
      });
      if (!g || g.ProgramSemesterId !== effectiveSemesterId) {
        return validationError("Elective pool does not belong to this semester");
      }
    }

    if (parsed.data.code !== undefined) {
      const existing = await prisma.courses.findFirst({
        where: { Id: { not: numericId }, Code: parsed.data.code },
      });
      if (existing) return validationError("Another course already has this code");
    }

    const electivePatch: { ElectiveGroupId?: number | null } = {};
    if (parsed.data.course_kind === "COMPULSORY") {
      electivePatch.ElectiveGroupId = null;
    } else if (parsed.data.elective_group_id !== undefined) {
      electivePatch.ElectiveGroupId = parsed.data.elective_group_id;
    }

    const updated = await prisma.courses.update({
      where: { Id: numericId },
      data: {
        ...(parsed.data.name !== undefined && { Name: parsed.data.name }),
        ...(parsed.data.code !== undefined && { Code: parsed.data.code }),
        ...(parsed.data.description !== undefined && { Description: parsed.data.description }),
        ...(parsed.data.prerequisites !== undefined && { Prerequisites: parsed.data.prerequisites }),
        ...(parsed.data.credits !== undefined && { Credits: parsed.data.credits }),
        ...(parsed.data.lecture_hours !== undefined && { LectureHours: parsed.data.lecture_hours }),
        ...(parsed.data.lab_hours !== undefined && { LabHours: parsed.data.lab_hours }),
        ...(parsed.data.status !== undefined && { Status: parsed.data.status }),
        ...(parsed.data.program_id !== undefined && { ProgramId: parsed.data.program_id }),
        ...(parsed.data.program_semester_id !== undefined && {
          ProgramSemesterId: parsed.data.program_semester_id,
        }),
        ...(parsed.data.course_kind !== undefined && { CourseKind: parsed.data.course_kind }),
        ...electivePatch,
      },
      include: courseApiInclude,
    });

    return json(toCourseResponse(updated));
  } catch {
    return internalError();
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await authorizeModuleRoute(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Course not found");

  try {
    const row = await prisma.courses.findUnique({
      where: { Id: numericId },
      select: { Id: true, Code: true, Name: true },
    });
    if (!row) return notFound("Course not found");

    // "Prerequisites" is stored as a String[] (course codes), so we must manually
    // maintain referential integrity when deleting.
    const dependents = await prisma.courses.findMany({
      where: { Prerequisites: { has: row.Code } },
      select: { Id: true, Name: true, Code: true, Prerequisites: true },
    });

    await prisma.$transaction([
      ...dependents.map((dep) =>
        prisma.courses.update({
          where: { Id: dep.Id },
          data: {
            Prerequisites: dep.Prerequisites.filter((code) => code !== row.Code),
          },
        })
      ),
      prisma.courses.delete({ where: { Id: numericId } }),
    ]);

    return json({
      message: "Course deleted",
      cleaned_prerequisites: dependents.map((d) => ({ id: d.Id, code: d.Code, name: d.Name })),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (message.includes("Foreign key") || message.includes("restrict")) {
      return validationError("Cannot delete course while it is assigned to terms");
    }
    return internalError();
  }
}
