import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, notFound, fromZodError, internalError, validationError } from "@/lib/api-utils";
import type { CourseResponse } from "@/lib/api-types";
import { safeValidateCourseUpdate } from "@/lib/validations/courses";

function parseId(id: string): number | null {
  const n = parseInt(id, 10);
  return Number.isNaN(n) || n < 1 ? null : n;
}

function toCourseResponse(row: {
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
  Program: {
    Name: string;
  };
  CreatedAt: Date;
  UpdatedAt: Date;
}): CourseResponse {
  return {
    id: row.Id,
    name: row.Name,
    code: row.Code,
    description: row.Description,
    prerequisites: row.Prerequisites,
    credits: row.Credits,
    lecture_hours: row.LectureHours,
    lab_hours: row.LabHours,
    status: row.Status as "ACTIVE" | "INACTIVE" | "ARCHIVED",
    program_id: row.ProgramId,
    program_name: row.Program.Name,
    created_at: row.CreatedAt.toISOString(),
    updated_at: row.UpdatedAt.toISOString(),
  };
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Course not found");

  try {
    const row = await prisma.courses.findUnique({
      where: { Id: numericId },
      include: { Program: { select: { Name: true } } },
    });
    if (!row) return notFound("Course not found");
    return json(toCourseResponse(row));
  } catch {
    return internalError();
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Course not found");

  try {
    const row = await prisma.courses.findUnique({
      where: { Id: numericId },
      include: { Program: { select: { Name: true } } },
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

    if (parsed.data.program_id !== undefined) {
      const program = await prisma.programs.findUnique({ where: { Id: parsed.data.program_id } });
      if (!program) return validationError("Program not found");
    }

    if (parsed.data.code !== undefined) {
      const existing = await prisma.courses.findFirst({
        where: { Id: { not: numericId }, Code: parsed.data.code },
      });
      if (existing) return validationError("Another course already has this code");
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
      },
      include: { Program: { select: { Name: true } } },
    });

    return json(toCourseResponse(updated));
  } catch {
    return internalError();
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Course not found");

  try {
    const row = await prisma.courses.findUnique({ where: { Id: numericId } });
    if (!row) return notFound("Course not found");

    await prisma.courses.delete({ where: { Id: numericId } });
    return new Response(null, { status: 204 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (message.includes("Foreign key") || message.includes("restrict")) {
      return validationError("Cannot delete course while it is assigned to terms");
    }
    return internalError();
  }
}
