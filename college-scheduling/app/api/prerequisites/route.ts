import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { requireAuth, requireAdmin } from "@/utils/auth";
import { prerequisiteSchema } from "@/utils/validation";
import type { Prerequisite } from "@/types";

async function getSemesterOrder(semesterId: string): Promise<number | null> {
  const sem = await prisma.semester.findUnique({
    where: { id: semesterId },
    select: { order: true },
  });
  return sem?.order ?? null;
}

function hasCircularDependency(
  subjectId: string,
  dependsOnId: string,
  visited: Set<string>,
  subjectToDeps: Map<string, string[]>
): boolean {
  if (subjectId === dependsOnId) return true;
  if (visited.has(dependsOnId)) return false;
  visited.add(dependsOnId);
  const deps = subjectToDeps.get(dependsOnId);
  if (!deps) return false;
  for (const d of deps) {
    if (d === subjectId || hasCircularDependency(subjectId, d, visited, subjectToDeps))
      return true;
  }
  return false;
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }
  const subjectId = request.nextUrl.searchParams.get("subjectId");
  try {
    const list = await prisma.prerequisite.findMany({
      where: subjectId ? { subjectId } : undefined,
      orderBy: [{ subjectId: "asc" }, { dependsOnId: "asc" }],
    });
    const data: Prerequisite[] = list.map((p) => ({
      id: p.id,
      subjectId: p.subjectId,
      dependsOnId: p.dependsOnId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch prerequisites" },
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
  const parsed = prerequisiteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { subjectId, dependsOnId } = parsed.data;

  try {
    const [subject, dependsOn] = await Promise.all([
      prisma.subject.findUnique({
        where: { id: subjectId },
        select: { semesterId: true },
      }),
      prisma.subject.findUnique({
        where: { id: dependsOnId },
        select: { semesterId: true },
      }),
    ]);
    if (!subject || !dependsOn) {
      return NextResponse.json(
        { error: "Subject or prerequisite subject not found" },
        { status: 404 }
      );
    }
    const subjectOrder = await getSemesterOrder(subject.semesterId);
    const dependsOrder = await getSemesterOrder(dependsOn.semesterId);
    if (
      subjectOrder === null ||
      dependsOrder === null ||
      dependsOrder >= subjectOrder
    ) {
      return NextResponse.json(
        { error: "Prerequisite must be from an earlier semester" },
        { status: 400 }
      );
    }

    const allPrereqs = await prisma.prerequisite.findMany({
      select: { subjectId: true, dependsOnId: true },
    });
    const subjectToDeps = new Map<string, string[]>();
    for (const p of allPrereqs) {
      if (p.subjectId === subjectId && p.dependsOnId === dependsOnId) {
        return NextResponse.json(
          { error: "This prerequisite already exists" },
          { status: 400 }
        );
      }
      if (!subjectToDeps.has(p.subjectId)) subjectToDeps.set(p.subjectId, []);
      subjectToDeps.get(p.subjectId)!.push(p.dependsOnId);
    }
    if (!subjectToDeps.has(subjectId)) subjectToDeps.set(subjectId, []);
    subjectToDeps.get(subjectId)!.push(dependsOnId);
    if (hasCircularDependency(subjectId, dependsOnId, new Set(), subjectToDeps)) {
      return NextResponse.json(
        { error: "Adding this prerequisite would create a circular dependency" },
        { status: 400 }
      );
    }

    const created = await prisma.prerequisite.create({
      data: { subjectId, dependsOnId },
    });
    const data: Prerequisite = {
      id: created.id,
      subjectId: created.subjectId,
      dependsOnId: created.dependsOnId,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
    return NextResponse.json(data, { status: 201 });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return NextResponse.json(
        { error: "This prerequisite already exists" },
        { status: 400 }
      );
    }
    if (e && typeof e === "object" && "code" in e && e.code === "P2003") {
      return NextResponse.json(
        { error: "Subject or prerequisite subject not found" },
        { status: 404 }
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create prerequisite" },
      { status: 500 }
    );
  }
}
