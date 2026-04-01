import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { fromZodError, internalError, unauthorized, json } from "@/lib/api-utils";
import { createSession, setSessionCookie, verifyPassword } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const user = await prisma.programsUsers.findUnique({
      where: { Email: parsed.data.email },
    });
    if (!user || !user.IsActive) return unauthorized("Invalid credentials");
    if (!verifyPassword(parsed.data.password, user.PasswordHash)) {
      return unauthorized("Invalid credentials");
    }

    const token = await createSession(user.Id);
    const response = json({
      id: user.Id,
      name: user.Name,
      email: user.Email,
      role: user.Role,
    });
    setSessionCookie(response, token);
    return response;
  } catch {
    return internalError();
  }
}

