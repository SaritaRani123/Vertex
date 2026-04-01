import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, notFound, fromZodError, internalError, validationError } from "@/lib/api-utils";
import type { SemesterResponse } from "@/lib/api-types";
import { safeValidateSemesterUpdate } from "@/lib/validations/semesters";
import { authorizeModuleRoute } from "@/lib/auth";

function parseId(id: string): number | null {
  const n = parseInt(id, 10);
  return Number.isNaN(n) || n < 1 ? null : n;
}

function toSemesterResponse(row: {
  Id: number;
  Year: number;
  Type: string;
  CreatedAt: Date;
  UpdatedAt: Date;
}): SemesterResponse {
  return {
    id: row.Id,
    year: row.Year,
    type: row.Type as "FALL" | "WINTER" | "SUMMER",
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
  if (numericId === null) return notFound("Semester not found");

  try {
    const row = await prisma.semesters.findUnique({ where: { Id: numericId } });
    if (!row) return notFound("Semester not found");
    return json(toSemesterResponse(row));
  } catch {
    return internalError();
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await authorizeModuleRoute(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Semester not found");

  try {
    const row = await prisma.semesters.findUnique({ where: { Id: numericId } });
    if (!row) return notFound("Semester not found");

    const body = await request.json();
    const parsed = safeValidateSemesterUpdate(body);
    if (!parsed.success) return fromZodError(parsed.error);

    if (Object.keys(parsed.data).length === 0) return json(toSemesterResponse(row));

    const year = parsed.data.year ?? row.Year;
    const type = parsed.data.type ?? row.Type;

    const existing = await prisma.semesters.findFirst({
      where: {
        Id: { not: numericId },
        Year: year,
        Type: type,
      },
    });

    if (existing) {
      return validationError("Another semester with this year and type already exists");
    }

    const updated = await prisma.semesters.update({
      where: { Id: numericId },
      data: {
        ...(parsed.data.year !== undefined && { Year: parsed.data.year }),
        ...(parsed.data.type !== undefined && { Type: parsed.data.type }),
      },
    });

    return json(toSemesterResponse(updated));
  } catch {
    return internalError();
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await authorizeModuleRoute(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Semester not found");

  try {
    const row = await prisma.semesters.findUnique({ where: { Id: numericId } });
    if (!row) return notFound("Semester not found");

    const termsCount = await prisma.terms.count({
      where: { SemesterId: numericId },
    });
    if (termsCount > 0) {
      return validationError(
        "Cannot delete this semester because it has term assignments. Remove the term assignments first.",
      );
    }

    await prisma.semesters.delete({ where: { Id: numericId } });
    return new Response(null, { status: 204 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (message.includes("Foreign key") || message.includes("restrict") || message.includes("cascade")) {
      return validationError(
        "Cannot delete this semester because it has term assignments. Remove the term assignments first.",
      );
    }
    return internalError();
  }
}
