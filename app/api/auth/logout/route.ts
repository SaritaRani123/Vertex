import { NextRequest } from "next/server";
import { json } from "@/lib/api-utils";
import { clearSessionCookie, deleteSessionByToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("programs_session")?.value;
  if (token) await deleteSessionByToken(token);
  const response = json({ success: true });
  clearSessionCookie(response);
  return response;
}

