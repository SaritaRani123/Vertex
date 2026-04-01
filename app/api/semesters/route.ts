import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, fromZodError, internalError, validationError } from "@/lib/api-utils";
import type { SemesterResponse, SemesterListResponse } from "@/lib/api-types";
import { safeValidateSemesterCreate } from "@/lib/validations/semesters";
import { authorizeModuleRoute } from "@/lib/auth";

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

export async function GET(request: NextRequest) {
  const auth = await authorizeModuleRoute(request);
  if ("response" in auth) return auth.response;
  try {
    const list = await prisma.semesters.findMany({ orderBy: [{ Year: "desc" }, { Type: "asc" }] });
    const data: SemesterListResponse = { data: list.map(toSemesterResponse) };
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
    const parsed = safeValidateSemesterCreate(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const existing = await prisma.semesters.findFirst({
      where: { Year: parsed.data.year, Type: parsed.data.type },
    });
    if (existing) {
      return validationError("A semester with this year and type already exists");
    }

    const created = await prisma.semesters.create({
      data: {
        Year: parsed.data.year,
        Type: parsed.data.type,
      },
    });

    return json(toSemesterResponse(created), 201);
  } catch {
    return internalError();
  }
}
