import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { requireAuth, requireAdmin } from "@/utils/auth";
import { departmentSchema } from "@/utils/validation";
import type { Department } from "@/types";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }
  try {
    const list = await prisma.department.findMany({
      orderBy: { name: "asc" },
    });
    const data: Department[] = list.map((d) => ({
      id: d.id,
      name: d.name,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
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
  const parsed = departmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  try {
    const created = await prisma.department.create({
      data: { name: parsed.data.name },
    });
    const data: Department = {
      id: created.id,
      name: created.name,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
    return NextResponse.json(data, { status: 201 });
  } catch (e: unknown) {
    const msg = e && typeof e === "object" && "code" in e && e.code === "P2002"
      ? "Department name already exists"
      : "Failed to create department";
    console.error(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
