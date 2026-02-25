import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { requireAuth } from "@/utils/auth";
import type { Semester } from "@/types";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }
  const programId = request.nextUrl.searchParams.get("programId");
  try {
    const list = await prisma.semester.findMany({
      where: programId ? { programId } : undefined,
      orderBy: [{ programId: "asc" }, { order: "asc" }],
    });
    const data: Semester[] = list.map((s) => ({
      id: s.id,
      name: s.name,
      order: s.order,
      programId: s.programId,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch semesters" },
      { status: 500 }
    );
  }
}
