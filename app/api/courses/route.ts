import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, fromZodError, internalError, validationError } from "@/lib/api-utils";
import type { CourseResponse, CourseListResponse } from "@/lib/api-types";
import { safeValidateCourseCreate } from "@/lib/validations/courses";
import { authorizeModuleRoute } from "@/lib/auth";

function toCourseResponse(row: {
  Id: number;
  Name: string;
  Code: string;
  Description: string | null;
  Prerequisites: string[];
  Credits: number;
  LectureHours: number;
  LabHours: number;
  Status: string;
  ProgramId: number;
  Program?: { Name: string } | null;
  CreatedAt: Date;
  UpdatedAt: Date;
}): CourseResponse {
  return {
    id: row.Id,
    name: row.Name,
    code: row.Code,
    description: row.Description,
    prerequisites: row.Prerequisites,
    credits: row.Credits,
    lecture_hours: row.LectureHours,
    lab_hours: row.LabHours,
    status: row.Status as "ACTIVE" | "INACTIVE" | "ARCHIVED",
    program_id: row.ProgramId,
    program_name: row.Program?.Name ?? "",
    created_at: row.CreatedAt.toISOString(),
    updated_at: row.UpdatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const auth = await authorizeModuleRoute(request);
  if ("response" in auth) return auth.response;
  try {
    const list = await prisma.courses.findMany({
      orderBy: [{ Code: "asc" }, { Name: "asc" }],
      include: { Program: { select: { Name: true } } },
    });
    const data: CourseListResponse = {
      data: list.map(toCourseResponse),
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
    const parsed = safeValidateCourseCreate(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const program = await prisma.programs.findUnique({ where: { Id: parsed.data.program_id } });
    if (!program) {
      return validationError("Program not found");
    }

    const existingCode = await prisma.courses.findUnique({
      where: { Code: parsed.data.code },
    });
    if (existingCode) {
      return validationError("A course with this code already exists");
    }

    const created = await prisma.courses.create({
      data: {
        Name: parsed.data.name,
        Code: parsed.data.code,
        Description: parsed.data.description ?? null,
        Prerequisites: parsed.data.prerequisites ?? [],
        Credits: parsed.data.credits,
        LectureHours: parsed.data.lecture_hours,
        LabHours: parsed.data.lab_hours,
        Status: parsed.data.status ?? "ACTIVE",
        ProgramId: parsed.data.program_id,
      },
      include: { Program: { select: { Name: true } } },
    });

    return json(toCourseResponse(created), 201);
  } catch {
    return internalError();
  }
}
