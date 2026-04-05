import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, fromZodError, internalError, validationError } from "@/lib/api-utils";
import type { ProgramResponse, ProgramListResponse, ProgramListItem, ProgramStatus } from "@/lib/api-types";
import { safeValidateProgramCreate } from "@/lib/validations/programs";
import { authorizeModuleRoute } from "@/lib/auth";
import { allocateUniqueProgramCode } from "@/lib/program-code";

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

function toProgramListItem(row: {
  Id: number;
  Name: string;
  Code: string;
  DurationYears: number;
  Status: string;
  DepartmentId: number;
  CreatedAt: Date;
  UpdatedAt: Date;
  Department: { Name: string };
}): ProgramListItem {
  return toProgramResponse(row);
}

export async function GET(request: NextRequest) {
  const auth = await authorizeModuleRoute(request);
  if ("response" in auth) return auth.response;
  try {
    const { searchParams } = new URL(request.url);
    const departmentIdParam = searchParams.get("department_id");
    const departmentId = departmentIdParam ? parseInt(departmentIdParam, 10) : null;
    const list = await prisma.programs.findMany({
      where: departmentId != null && !Number.isNaN(departmentId) ? { DepartmentId: departmentId } : undefined,
      orderBy: [{ Department: { Name: "asc" } }, { Name: "asc" }],
      include: { Department: { select: { Name: true } } },
    });
    const data: ProgramListResponse = {
      data: list.map(toProgramListItem),
    };
    return json(data);
  } catch {
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  const auth = await authorizeModuleRoute(request);
  if ("response" in auth) return auth.response;
  try {
    const body = await request.json();
    const parsed = safeValidateProgramCreate(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }
    const department = await prisma.departments.findUnique({
      where: { Id: parsed.data.department_id },
    });
    if (!department) {
      return validationError("Department not found");
    }
    const codeRaw = parsed.data.code?.trim();
    const code =
      codeRaw && codeRaw.length > 0
        ? codeRaw
        : await allocateUniqueProgramCode(prisma, parsed.data.name);

    const existingCode = await prisma.programs.findUnique({
      where: { Code: code },
    });
    if (existingCode) {
      return validationError("A program with this code already exists");
    }
    const existingNameDept = await prisma.programs.findFirst({
      where: {
        Name: parsed.data.name,
        DepartmentId: parsed.data.department_id,
      },
    });
    if (existingNameDept) {
      return validationError(
        "A program with this name already exists in this department"
      );
    }
    const semesterCount = parsed.data.duration_years * 2;
    const created = await prisma.$transaction(async (tx) => {
      const prog = await tx.programs.create({
        data: {
          Name: parsed.data.name,
          Code: code,
          DurationYears: parsed.data.duration_years,
          Status: parsed.data.status ?? "ACTIVE",
          DepartmentId: parsed.data.department_id,
        },
      });
      await tx.programSemesters.createMany({
        data: Array.from({ length: semesterCount }, (_, i) => ({
          ProgramId: prog.Id,
          Sequence: i + 1,
        })),
      });
      return prog;
    });
    const withDept = await prisma.programs.findUnique({
      where: { Id: created.Id },
      include: { Department: { select: { Name: true } } },
    });
    if (!withDept) return internalError();
    return json(toProgramResponse(withDept), 201);
  } catch {
    return internalError();
  }
}
