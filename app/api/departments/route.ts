import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, validationError, fromZodError, internalError } from "@/lib/api-utils";
import type { DepartmentResponse, DepartmentListResponse } from "@/lib/api-types";
import { safeValidateDepartmentCreate } from "@/lib/validations/departments";

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

export async function GET() {
  try {
    const list = await prisma.departments.findMany({
      orderBy: { name: "asc" },
    });
    const data: DepartmentListResponse = {
      data: list.map(toDepartmentResponse),
    };
    return json(data);
  } catch {
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = safeValidateDepartmentCreate(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }
    const existing = await prisma.departments.findFirst({
      where: {
        OR: [{ code: parsed.data.code }, { name: parsed.data.name }],
      },
    });
    if (existing) {
      return validationError(
        existing.code === parsed.data.code
          ? "A department with this code already exists"
          : "A department with this name already exists"
      );
    }
    const created = await prisma.departments.create({
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
      },
    });
    return json(toDepartmentResponse(created), 201);
  } catch {
    return internalError();
  }
}
