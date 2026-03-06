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
  id: number;
  name: string;
  code: string;
  created_at: Date;
  updated_at: Date;
}): DepartmentResponse {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
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
  if (numericId === null) return notFound("Department not found");
  try {
    const row = await prisma.departments.findUnique({ where: { id: numericId } });
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
    const row = await prisma.departments.findUnique({ where: { id: numericId } });
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
          id: { not: numericId },
          OR: [
            ...(parsed.data.code ? [{ code: parsed.data.code }] : []),
            ...(parsed.data.name ? [{ name: parsed.data.name }] : []),
          ],
        },
      });
      if (existing) {
        return validationError(
          existing.code === parsed.data.code
            ? "Another department already has this code"
            : "Another department already has this name"
        );
      }
    }

    const updated = await prisma.departments.update({
      where: { id: numericId },
      data: parsed.data,
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
    const row = await prisma.departments.findUnique({ where: { id: numericId } });
    if (!row) return notFound("Department not found");
    await prisma.departments.delete({ where: { id: numericId } });
    return new Response(null, { status: 204 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (message.includes("Foreign key") || message.includes("restrict")) {
      return validationError("Cannot delete department while it has programs");
    }
    return internalError();
  }
}
