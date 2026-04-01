import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { fromZodError, internalError, json, forbidden } from "@/lib/api-utils";
import { requireSession } from "@/lib/auth";

const createSchema = z.object({
  module: z.enum(["departments", "programs", "courses", "semesters", "terms"]),
  action: z.enum(["CREATE", "DELETE"]),
  payload: z.unknown().optional(),
});

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if ("response" in session) return session.response;
  try {
    const list = await prisma.programsPermissionRequests.findMany({
      where: session.user.role === "ADMIN" ? undefined : { RequesterId: session.user.id },
      orderBy: { CreatedAt: "desc" },
      include: {
        Requester: { select: { Id: true, Name: true, Email: true } },
        ReviewedBy: { select: { Id: true, Name: true, Email: true } },
      },
    });
    return json({
      data: list.map((r) => ({
        id: r.Id,
        module: r.Module,
        action: r.Action,
        status: r.Status,
        payload: r.PayloadJson ? JSON.parse(r.PayloadJson) : null,
        review_note: r.ReviewNote,
        requester: r.Requester,
        reviewed_by: r.ReviewedBy,
        created_at: r.CreatedAt.toISOString(),
        updated_at: r.UpdatedAt.toISOString(),
      })),
    });
  } catch {
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if ("response" in session) return session.response;
  if (session.user.role !== "STAFF") {
    return forbidden("Only STAFF can submit permission requests");
  }
  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);
    const created = await prisma.programsPermissionRequests.create({
      data: {
        RequesterId: session.user.id,
        Module: parsed.data.module,
        Action: parsed.data.action,
        PayloadJson: parsed.data.payload === undefined ? null : JSON.stringify(parsed.data.payload),
      },
    });
    return json({
      id: created.Id,
      module: created.Module,
      action: created.Action,
      status: created.Status,
      created_at: created.CreatedAt.toISOString(),
    }, 201);
  } catch {
    return internalError();
  }
}

