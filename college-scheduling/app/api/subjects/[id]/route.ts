import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { requireAuth, requireAdmin } from "@/utils/auth";
import { subjectSchema } from "@/utils/validation";
import type { Subject } from "@/types";

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
    const s = await prisma.subject.findUnique({ where: { id } });
    if (!s) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }
    const data: Subject = {
      id: s.id,
      code: s.code,
      name: s.name,
      credits: s.credits,
      lectureHours: s.lectureHours,
      labHours: s.labHours,
      semesterId: s.semesterId,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    };
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch subject" },
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
  const parsed = subjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  try {
    const updated = await prisma.subject.update({
      where: { id },
      data: {
        code: parsed.data.code,
        name: parsed.data.name,
        credits: parsed.data.credits,
        lectureHours: parsed.data.lectureHours,
        labHours: parsed.data.labHours,
        semesterId: parsed.data.semesterId,
      },
    });
    const data: Subject = {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      credits: updated.credits,
      lectureHours: updated.lectureHours,
      labHours: updated.labHours,
      semesterId: updated.semesterId,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
    return NextResponse.json(data, { status: 200 });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return NextResponse.json(
        { error: "Subject code already exists" },
        { status: 500 }
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update subject" },
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
    await prisma.subject.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
