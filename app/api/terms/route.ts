import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, fromZodError, internalError, validationError } from "@/lib/api-utils";
import type { TermListResponse, TermResponse } from "@/lib/api-types";
import { safeValidateTermCreate } from "@/lib/validations/terms";
import { authorizeModuleRoute } from "@/lib/auth";

function toTermResponse(row: {
  Id: number;
  SemesterId: number;
  CourseId: number;
  CreatedAt: Date;
  Semester: { Year: number; Type: "FALL" | "WINTER" | "SUMMER" };
  Course: { Name: string; Code: string };
}): TermResponse & { semester_year: number; semester_type: "FALL" | "WINTER" | "SUMMER"; course_name: string; course_code: string } {
  return {
    id: row.Id,
    semester_id: row.SemesterId,
    course_id: row.CourseId,
    created_at: row.CreatedAt.toISOString(),
    semester_year: row.Semester.Year,
    semester_type: row.Semester.Type,
    course_name: row.Course.Name,
    course_code: row.Course.Code,
  };
}

export async function GET(request: NextRequest) {
  const auth = await authorizeModuleRoute(request);
  if ("response" in auth) return auth.response;
  try {
    const list = await prisma.terms.findMany({
      orderBy: [{ CreatedAt: "desc" }],
      include: {
        Semester: true,
        Course: true,
      },
    });
    const data: TermListResponse = { data: list.map(toTermResponse) };
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
    const parsed = safeValidateTermCreate(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const semester = await prisma.semesters.findUnique({ where: { Id: parsed.data.semester_id } });
    if (!semester) return validationError("Semester not found");

    const course = await prisma.courses.findUnique({ where: { Id: parsed.data.course_id } });
    if (!course) return validationError("Course not found");

    const existing = await prisma.terms.findUnique({
      where: {
        terms_semester_id_course_id_key: {
          SemesterId: parsed.data.semester_id,
          CourseId: parsed.data.course_id,
        },
      },
    });
    if (existing) {
      return validationError("This course is already assigned to the semester");
    }

    const created = await prisma.terms.create({
      data: {
        SemesterId: parsed.data.semester_id,
        CourseId: parsed.data.course_id,
      },
    });

    const response: TermResponse = {
      id: created.Id,
      semester_id: created.SemesterId,
      course_id: created.CourseId,
      created_at: created.CreatedAt.toISOString(),
    };

    return json(response, 201);
  } catch {
    return internalError();
  }
}
