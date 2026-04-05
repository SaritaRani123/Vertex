import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, notFound, fromZodError, internalError, validationError } from "@/lib/api-utils";
import type { ProgramResponse, ProgramStatus } from "@/lib/api-types";
import { safeValidateProgramUpdate } from "@/lib/validations/programs";
import { authorizeModuleRoute } from "@/lib/auth";
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
    const row = await prisma.programs.findUnique({
      where: { Id: numericId },
      include: { Department: { select: { Name: true } } },
    });
    if (!row) return notFound("Program not found");
    return json(toProgramResponse(row));
  } catch {
    return internalError();
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await authorizeModuleRoute(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Program not found");
  try {
    const row = await prisma.programs.findUnique({ where: { Id: numericId } });
    if (!row) return notFound("Program not found");

    const body = await request.json();
    const parsed = safeValidateProgramUpdate(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    if (Object.keys(parsed.data).length === 0) {
      const full = await prisma.programs.findUnique({
        where: { Id: numericId },
        include: { Department: { select: { Name: true } } },
      });
      if (!full) return notFound("Program not found");
      return json(toProgramResponse(full));
    }

    if (parsed.data.department_id !== undefined) {
      const dept = await prisma.departments.findUnique({
        where: { Id: parsed.data.department_id },
      });
      if (!dept) return validationError("Department not found");
    }

    if (parsed.data.code !== undefined) {
      const existing = await prisma.programs.findFirst({
        where: { Id: { not: numericId }, Code: parsed.data.code },
      });
      if (existing) return validationError("Another program already has this code");
    }

    if (
      (parsed.data.name !== undefined && parsed.data.department_id !== undefined) ||
      (parsed.data.name !== undefined && parsed.data.department_id === undefined)
    ) {
      const name = parsed.data.name ?? row.Name;
      const deptId = parsed.data.department_id ?? row.DepartmentId;
      const existing = await prisma.programs.findFirst({
        where: {
          Id: { not: numericId },
          Name: name,
          DepartmentId: deptId,
        },
      });
      if (existing) {
        return validationError(
          "A program with this name already exists in this department"
        );
      }
    }

    const updated = await prisma.programs.update({
      where: { Id: numericId },
      data: {
        ...(parsed.data.name !== undefined && { Name: parsed.data.name }),
        ...(parsed.data.code !== undefined && { Code: parsed.data.code }),
        ...(parsed.data.duration_years !== undefined && {
          DurationYears: parsed.data.duration_years,
        }),
        ...(parsed.data.status !== undefined && { Status: parsed.data.status }),
        ...(parsed.data.department_id !== undefined && {
          DepartmentId: parsed.data.department_id,
        }),
      },
      include: { Department: { select: { Name: true } } },
    });
    if (parsed.data.duration_years !== undefined) {
      await ensureProgramSemestersForDuration(prisma, numericId, updated.DurationYears);
    }
    return json(toProgramResponse(updated));
  } catch {
    return internalError();
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await authorizeModuleRoute(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Program not found");
  try {
    const row = await prisma.programs.findUnique({ where: { Id: numericId } });
    if (!row) return notFound("Program not found");

    const coursesCount = await prisma.courses.count({
      where: { ProgramId: numericId },
    });
    if (coursesCount > 0) {
      return validationError(
        "Cannot delete this program because it has courses. Remove or reassign the courses first.",
      );
    }

    await prisma.programs.delete({ where: { Id: numericId } });
    return new Response(null, { status: 204 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (message.includes("Foreign key") || message.includes("restrict")) {
      return validationError(
        "Cannot delete this program because it has courses. Remove or reassign the courses first.",
      );
    }
    return internalError();
  }
}
