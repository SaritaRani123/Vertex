import { NextRequest } from "next/server";
import { json } from "@/lib/api-utils";
import { requireSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if ("response" in session) return session.response;
  return json(session.user);
}

