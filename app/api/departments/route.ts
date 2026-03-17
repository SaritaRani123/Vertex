import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, validationError, fromZodError, internalError } from "@/lib/api-utils";
import type { DepartmentResponse, DepartmentListResponse } from "@/lib/api-types";
import { safeValidateDepartmentCreate } from "@/lib/validations/departments";

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

export async function GET() {
  try {
    const list = await prisma.departments.findMany({
      orderBy: { Name: "asc" },
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
        OR: [{ Code: parsed.data.code }, { Name: parsed.data.name }],
      },
    });
    if (existing) {
      return validationError(
        existing.Code === parsed.data.code
          ? "A department with this code already exists"
          : "A department with this name already exists"
      );
    }
    const created = await prisma.departments.create({
      data: {
        Name: parsed.data.name,
        Code: parsed.data.code,
      },
    });
    return json(toDepartmentResponse(created), 201);
  } catch {
    return internalError();
  }
}
