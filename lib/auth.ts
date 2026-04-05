import { randomBytes, scryptSync, timingSafeEqual, createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { forbidden, unauthorized } from "@/lib/api-utils";

export type Role = "ADMIN" | "STAFF";

const SESSION_COOKIE = "programs_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  await prisma.programsSessions.create({
    data: {
      UserId: userId,
      TokenHash: tokenHash,
      ExpiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
  return token;
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function deleteSessionByToken(token: string): Promise<void> {
  await prisma.programsSessions.deleteMany({
    where: { TokenHash: sha256(token) },
  });
}

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: Role;
};

export async function getSessionUser(request: NextRequest): Promise<SessionUser | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const tokenHash = sha256(token);

  const session = await prisma.programsSessions.findUnique({
    where: { TokenHash: tokenHash },
    include: { User: true },
  });
  if (!session) return null;
  if (session.ExpiresAt.getTime() < Date.now()) {
    await prisma.programsSessions.delete({ where: { TokenHash: tokenHash } }).catch(() => {});
    return null;
  }
  if (!session.User.IsActive) return null;
  return {
    id: session.User.Id,
    email: session.User.Email,
    name: session.User.Name,
    role: session.User.Role as Role,
  };
}

export async function requireSession(
  request: NextRequest
): Promise<{ user: SessionUser } | { response: NextResponse }> {
  const user = await getSessionUser(request);
  if (!user) return { response: unauthorized("Please sign in") };
  return { user };
}

export function methodNeedsAdmin(method: string): boolean {
  return method === "POST" || method === "DELETE";
}

export async function authorizeModuleRoute(
  request: NextRequest
): Promise<{ user: SessionUser } | { response: NextResponse }> {
  const session = await requireSession(request);
  if ("response" in session) return session;
  const { user } = session;
  if (methodNeedsAdmin(request.method) && user.role !== "ADMIN") {
    return { response: forbidden("Staff cannot create/delete directly. Submit admin permission request.") };
  }
  return { user };
}

/**
 * Course APIs: any signed-in user may list, create, and update courses (curriculum work).
 * DELETE stays admin-only so removing catalog entries stays restricted.
 */
export async function authorizeCoursesApi(
  request: NextRequest
): Promise<{ user: SessionUser } | { response: NextResponse }> {
  const session = await requireSession(request);
  if ("response" in session) return session;
  if (request.method === "DELETE" && session.user.role !== "ADMIN") {
    return {
      response: forbidden(
        "Only administrators can delete courses. You can still add and edit courses."
      ),
    };
  }
  return session;
}

