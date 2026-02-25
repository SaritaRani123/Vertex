import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { requireAuth, requireAdmin } from "@/utils/auth";
import { subjectSchema } from "@/utils/validation";
import type { Subject } from "@/types";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }
  const semesterId = request.nextUrl.searchParams.get("semesterId");
  try {
    const list = await prisma.subject.findMany({
      where: semesterId ? { semesterId } : undefined,
      orderBy: [{ semesterId: "asc" }, { code: "asc" }],
    });
    const data: Subject[] = list.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      credits: s.credits,
      lectureHours: s.lectureHours,
      labHours: s.labHours,
      semesterId: s.semesterId,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
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
  const parsed = subjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  try {
    const created = await prisma.subject.create({
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
      id: created.id,
      code: created.code,
      name: created.name,
      credits: created.credits,
      lectureHours: created.lectureHours,
      labHours: created.labHours,
      semesterId: created.semesterId,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
    return NextResponse.json(data, { status: 201 });
  } catch (e: unknown) {
    const msg =
      e && typeof e === "object" && "code" in e && e.code === "P2002"
        ? "Subject code already exists"
        : "Failed to create subject";
    console.error(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
