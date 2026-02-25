import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { requireAuth, requireAdmin } from "@/utils/auth";
import { programSchema } from "@/utils/validation";
import type { Program } from "@/types";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }
  const departmentId = request.nextUrl.searchParams.get("departmentId");
  try {
    const list = await prisma.program.findMany({
      where: departmentId ? { departmentId } : undefined,
      orderBy: [{ departmentId: "asc" }, { name: "asc" }],
    });
    const data: Program[] = list.map((p) => ({
      id: p.id,
      name: p.name,
      duration: p.duration,
      degreeType: p.degreeType,
      totalCredits: p.totalCredits,
      departmentId: p.departmentId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  const parsed = programSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  try {
    const created = await prisma.program.create({
      data: {
        name: parsed.data.name,
        duration: parsed.data.duration,
        degreeType: parsed.data.degreeType,
        totalCredits: parsed.data.totalCredits,
        departmentId: parsed.data.departmentId,
      },
    });
    // Auto-generate semesters based on duration
    await prisma.semester.createMany({
      data: Array.from({ length: created.duration * 2 }, (_, i) => ({
        programId: created.id,
        name: `Semester ${i + 1}`,
        order: i + 1,
      })),
    });
    const data: Program = {
      id: created.id,
      name: created.name,
      duration: created.duration,
      degreeType: created.degreeType,
      totalCredits: created.totalCredits,
      departmentId: created.departmentId,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
    return NextResponse.json(data, { status: 201 });
  } catch (e: unknown) {
    const msg =
      e && typeof e === "object" && "code" in e && e.code === "P2002"
        ? "Program name already exists in this department"
        : "Failed to create program";
    console.error(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
