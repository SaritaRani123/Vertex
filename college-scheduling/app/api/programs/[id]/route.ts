import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { requireAuth, requireAdmin } from "@/utils/auth";
import { programSchema } from "@/utils/validation";
import type { Program } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: Params
) {
  const auth = await requireAuth();
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }
  const { id } = await params;
  try {
    const p = await prisma.program.findUnique({ where: { id } });
    if (!p) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }
    const data: Program = {
      id: p.id,
      name: p.name,
      duration: p.duration,
      degreeType: p.degreeType,
      totalCredits: p.totalCredits,
      departmentId: p.departmentId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch program" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }
  const { id } = await params;
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
    const updated = await prisma.program.update({
      where: { id },
      data: {
        name: parsed.data.name,
        duration: parsed.data.duration,
        degreeType: parsed.data.degreeType,
        totalCredits: parsed.data.totalCredits,
        departmentId: parsed.data.departmentId,
      },
    });
    const data: Program = {
      id: updated.id,
      name: updated.name,
      duration: updated.duration,
      degreeType: updated.degreeType,
      totalCredits: updated.totalCredits,
      departmentId: updated.departmentId,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
    return NextResponse.json(data, { status: 200 });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return NextResponse.json(
        { error: "Program name already exists in this department" },
        { status: 500 }
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update program" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: Params
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }
  const { id } = await params;
  try {
    await prisma.program.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 }
    );
  }
}
