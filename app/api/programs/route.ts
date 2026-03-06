import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, fromZodError, internalError, validationError } from "@/lib/api-utils";
import type { ProgramResponse, ProgramListResponse, ProgramStatus } from "@/lib/api-types";
import { safeValidateProgramCreate } from "@/lib/validations/programs";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentIdParam = searchParams.get("department_id");
    const departmentId = departmentIdParam ? parseInt(departmentIdParam, 10) : null;
    const list = await prisma.programs.findMany({
      where: departmentId != null && !Number.isNaN(departmentId) ? { department_id: departmentId } : undefined,
      orderBy: [{ department: { name: "asc" } }, { name: "asc" }],
      include: { department: false },
    });
    const data: ProgramListResponse = {
      data: list.map(toProgramResponse),
    };
    return json(data);
  } catch {
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = safeValidateProgramCreate(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }
    const department = await prisma.departments.findUnique({
      where: { id: parsed.data.department_id },
    });
    if (!department) {
      return validationError("Department not found");
    }
    const existingCode = await prisma.programs.findUnique({
      where: { code: parsed.data.code },
    });
    if (existingCode) {
      return validationError("A program with this code already exists");
    }
    const existingNameDept = await prisma.programs.findFirst({
      where: {
        name: parsed.data.name,
        department_id: parsed.data.department_id,
      },
    });
    if (existingNameDept) {
      return validationError(
        "A program with this name already exists in this department"
      );
    }
    const created = await prisma.programs.create({
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
        duration_years: parsed.data.duration_years,
        status: parsed.data.status ?? "ACTIVE",
        department_id: parsed.data.department_id,
      },
    });
    return json(toProgramResponse(created), 201);
  } catch {
    return internalError();
  }
}
