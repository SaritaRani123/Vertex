import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { fromZodError, internalError, json, forbidden, notFound, validationError } from "@/lib/api-utils";
import { requireSession } from "@/lib/auth";

const reviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  review_note: z.string().max(500).optional(),
});

function parseId(id: string): number | null {
  const n = parseInt(id, 10);
  return Number.isNaN(n) || n < 1 ? null : n;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await requireSession(request);
  if ("response" in session) return session.response;
  if (session.user.role !== "ADMIN") {
    return forbidden("Only ADMIN can review permission requests");
  }
  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) return notFound("Permission request not found");

  try {
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const existing = await prisma.programsPermissionRequests.findUnique({
      where: { Id: numericId },
    });
    if (!existing) return notFound("Permission request not found");
    if (existing.Status !== "PENDING") {
      return validationError("Only pending requests can be reviewed");
    }

    const updated = await prisma.programsPermissionRequests.update({
      where: { Id: numericId },
      data: {
        Status: parsed.data.status,
        ReviewNote: parsed.data.review_note,
        ReviewedById: session.user.id,
      },
    });
    return json({
      id: updated.Id,
      status: updated.Status,
      review_note: updated.ReviewNote,
      reviewed_by_id: updated.ReviewedById,
      updated_at: updated.UpdatedAt.toISOString(),
    });
  } catch {
    return internalError();
  }
}

