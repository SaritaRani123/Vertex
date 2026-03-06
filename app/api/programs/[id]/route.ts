import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, notFound, fromZodError, internalError, validationError } from "@/lib/api-utils";
import type { ProgramResponse, ProgramStatus } from "@/lib/api-types";
import { safeValidateProgramUpdate } from "@/lib/validations/programs";

function parseId(id: string): number | null {
  const n = parseInt(id, 10);
  return Number.isNaN(n) || n < 1 ? null : n;
}

function toProgramResponse(row: {
  id: number;
  name: string;
  code: string;
  duration_years: number;
  status: string;
  department_id: number;
  created_at: Date;
  updated_at: Date;
}): ProgramResponse {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    duration_years: row.duration_years,
    status: row.status as ProgramStatus,
    department_id: row.department_id,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Program not found");
  try {
    const row = await prisma.programs.findUnique({ where: { id: numericId } });
    if (!row) return notFound("Program not found");
    return json(toProgramResponse(row));
  } catch {
    return internalError();
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Program not found");
  try {
    const row = await prisma.programs.findUnique({ where: { id: numericId } });
    if (!row) return notFound("Program not found");

    const body = await request.json();
    const parsed = safeValidateProgramUpdate(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    if (Object.keys(parsed.data).length === 0) {
      return json(toProgramResponse(row));
    }

    if (parsed.data.department_id !== undefined) {
      const dept = await prisma.departments.findUnique({
        where: { id: parsed.data.department_id },
      });
      if (!dept) return validationError("Department not found");
    }

    if (parsed.data.code !== undefined) {
      const existing = await prisma.programs.findFirst({
        where: { id: { not: numericId }, code: parsed.data.code },
      });
      if (existing) return validationError("Another program already has this code");
    }

    if (
      (parsed.data.name !== undefined && parsed.data.department_id !== undefined) ||
      (parsed.data.name !== undefined && parsed.data.department_id === undefined)
    ) {
      const name = parsed.data.name ?? row.name;
      const deptId = parsed.data.department_id ?? row.department_id;
      const existing = await prisma.programs.findFirst({
        where: {
          id: { not: numericId },
          name: name,
          department_id: deptId,
        },
      });
      if (existing) {
        return validationError(
          "A program with this name already exists in this department"
        );
      }
    }

    const updated = await prisma.programs.update({
      where: { id: numericId },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.code !== undefined && { code: parsed.data.code }),
        ...(parsed.data.duration_years !== undefined && {
          duration_years: parsed.data.duration_years,
        }),
        ...(parsed.data.status !== undefined && { status: parsed.data.status }),
        ...(parsed.data.department_id !== undefined && {
          department_id: parsed.data.department_id,
        }),
      },
    });
    return json(toProgramResponse(updated));
  } catch {
    return internalError();
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Program not found");
  try {
    const row = await prisma.programs.findUnique({ where: { id: numericId } });
    if (!row) return notFound("Program not found");
    await prisma.programs.delete({ where: { id: numericId } });
    return new Response(null, { status: 204 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (message.includes("Foreign key") || message.includes("restrict")) {
      return validationError(
        "Cannot delete program while it has courses"
      );
    }
    return internalError();
  }
}
