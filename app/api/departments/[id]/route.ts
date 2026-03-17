import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, notFound, fromZodError, internalError, validationError } from "@/lib/api-utils";
import type { DepartmentResponse } from "@/lib/api-types";
import { safeValidateDepartmentUpdate } from "@/lib/validations/departments";

function parseId(id: string): number | null {
  const n = parseInt(id, 10);
  return Number.isNaN(n) || n < 1 ? null : n;
}

function toDepartmentResponse(row: {
  Id: number;
  Name: string;
  Code: string;
  CreatedAt: Date;
  UpdatedAt: Date;
}): DepartmentResponse {
  return {
    id: row.Id,
    name: row.Name,
    code: row.Code,
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
  if (numericId === null) return notFound("Department not found");
  try {
    const row = await prisma.departments.findUnique({ where: { Id: numericId } });
    if (!row) return notFound("Department not found");
    return json(toDepartmentResponse(row));
  } catch {
    return internalError();
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Department not found");
  try {
    const row = await prisma.departments.findUnique({ where: { Id: numericId } });
    if (!row) return notFound("Department not found");

    const body = await request.json();
    const parsed = safeValidateDepartmentUpdate(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    if (Object.keys(parsed.data).length === 0) {
      return json(toDepartmentResponse(row));
    }

    if (parsed.data.code !== undefined || parsed.data.name !== undefined) {
      const existing = await prisma.departments.findFirst({
        where: {
          Id: { not: numericId },
          OR: [
            ...(parsed.data.code ? [{ Code: parsed.data.code }] : []),
            ...(parsed.data.name ? [{ Name: parsed.data.name }] : []),
          ],
        },
      });
      if (existing) {
        return validationError(
          existing.Code === parsed.data.code
            ? "Another department already has this code"
            : "Another department already has this name"
        );
      }
    }

    const updated = await prisma.departments.update({
      where: { Id: numericId },
      data: {
        ...(parsed.data.name !== undefined && { Name: parsed.data.name }),
        ...(parsed.data.code !== undefined && { Code: parsed.data.code }),
      },
    });
    return json(toDepartmentResponse(updated));
  } catch {
    return internalError();
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Department not found");
  try {
    const row = await prisma.departments.findUnique({ where: { Id: numericId } });
    if (!row) return notFound("Department not found");

    const programsCount = await prisma.programs.count({
      where: { DepartmentId: numericId },
    });
    if (programsCount > 0) {
      return validationError(
        "Cannot delete this department because it has programs. Remove or reassign the programs first.",
      );
    }

    await prisma.departments.delete({ where: { Id: numericId } });
    return new Response(null, { status: 204 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (message.includes("Foreign key") || message.includes("restrict")) {
      return validationError(
        "Cannot delete this department because it has programs. Remove or reassign the programs first.",
      );
    }
    return internalError();
  }
}
