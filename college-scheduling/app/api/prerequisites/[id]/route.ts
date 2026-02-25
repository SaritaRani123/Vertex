import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { requireAuth, requireAdmin } from "@/utils/auth";
import type { Prerequisite } from "@/types";

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
    const p = await prisma.prerequisite.findUnique({ where: { id } });
    if (!p) {
      return NextResponse.json(
        { error: "Prerequisite not found" },
        { status: 404 }
      );
    }
    const data: Prerequisite = {
      id: p.id,
      subjectId: p.subjectId,
      dependsOnId: p.dependsOnId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch prerequisite" },
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
    await prisma.prerequisite.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
      return NextResponse.json(
        { error: "Prerequisite not found" },
        { status: 404 }
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete prerequisite" },
      { status: 500 }
    );
  }
}
