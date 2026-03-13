import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, notFound, internalError, fromZodError, validationError } from "@/lib/api-utils";
import type { TermResponse } from "@/lib/api-types";
import { safeValidateTermUpdate } from "@/lib/validations/terms";

function parseId(id: string): number | null {
  const n = parseInt(id, 10);
  return Number.isNaN(n) || n < 1 ? null : n;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Term not found");

  try {
    const row = await prisma.terms.findUnique({ where: { Id: numericId } });
    if (!row) return notFound("Term not found");

    const response: TermResponse = {
      id: row.Id,
      semester_id: row.SemesterId,
      course_id: row.CourseId,
      created_at: row.CreatedAt.toISOString(),
    };

    return json(response);
  } catch {
    return internalError();
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Term not found");

  try {
    const row = await prisma.terms.findUnique({ where: { Id: numericId } });
    if (!row) return notFound("Term not found");

    const body = await request.json();
    const parsed = safeValidateTermUpdate(body);
    if (!parsed.success) return fromZodError(parsed.error);

    if (Object.keys(parsed.data).length === 0) {
      const response: TermResponse = {
        id: row.Id,
        semester_id: row.SemesterId,
        course_id: row.CourseId,
        created_at: row.CreatedAt.toISOString(),
      };
      return json(response);
    }

    if (parsed.data.semester_id !== undefined) {
      const semester = await prisma.semesters.findUnique({ where: { Id: parsed.data.semester_id } });
      if (!semester) return validationError("Semester not found");
    }
    if (parsed.data.course_id !== undefined) {
      const course = await prisma.courses.findUnique({ where: { Id: parsed.data.course_id } });
      if (!course) return validationError("Course not found");
    }

    const updated = await prisma.terms.update({
      where: { Id: numericId },
      data: {
        ...(parsed.data.semester_id !== undefined && { SemesterId: parsed.data.semester_id }),
        ...(parsed.data.course_id !== undefined && { CourseId: parsed.data.course_id }),
      },
    });

    const response: TermResponse = {
      id: updated.Id,
      semester_id: updated.SemesterId,
      course_id: updated.CourseId,
      created_at: updated.CreatedAt.toISOString(),
    };

    return json(response);
  } catch {
    return internalError();
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Term not found");

  try {
    const row = await prisma.terms.findUnique({ where: { Id: numericId } });
    if (!row) return notFound("Term not found");

    await prisma.terms.delete({ where: { Id: numericId } });
    return new Response(null, { status: 204 });
  } catch {
    return internalError();
  }
}
