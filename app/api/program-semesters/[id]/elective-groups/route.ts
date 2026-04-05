import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { json, notFound, fromZodError, internalError } from "@/lib/api-utils";
import { safeValidateElectiveGroupCreate } from "@/lib/validations/elective-groups";
import { authorizeModuleRoute } from "@/lib/auth";

function parseId(id: string): number | null {
  const n = parseInt(id, 10);
  return Number.isNaN(n) || n < 1 ? null : n;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await authorizeModuleRoute(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Program semester not found");

  try {
    const semester = await prisma.programSemesters.findUnique({
      where: { Id: numericId },
      select: { Id: true },
    });
    if (!semester) return notFound("Program semester not found");

    const body = await request.json();
    const parsed = safeValidateElectiveGroupCreate(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const created = await prisma.electiveGroups.create({
      data: {
        ProgramSemesterId: numericId,
        ChooseCount: parsed.data.choose_count,
        Label: parsed.data.label ?? null,
      },
    });

    return json(
      {
        id: created.Id,
        program_semester_id: created.ProgramSemesterId,
        choose_count: created.ChooseCount,
        label: created.Label,
      },
      201
    );
  } catch {
    return internalError();
  }
}
