import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { fromZodError, internalError, json, validationError } from "@/lib/api-utils";
import { createSession, hashPassword, setSessionCookie } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(128),
  role: z.enum(["ADMIN", "STAFF"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const existing = await prisma.programsUsers.findUnique({
      where: { Email: parsed.data.email },
    });
    if (existing) return validationError("Email already registered");

    const usersCount = await prisma.programsUsers.count();
    const role = usersCount === 0 ? "ADMIN" : (parsed.data.role ?? "STAFF");

    const user = await prisma.programsUsers.create({
      data: {
        Name: parsed.data.name,
        Email: parsed.data.email,
        PasswordHash: hashPassword(parsed.data.password),
        Role: role,
      },
    });

    const token = await createSession(user.Id);
    const response = json({
      id: user.Id,
      name: user.Name,
      email: user.Email,
      role: user.Role,
    }, 201);
    setSessionCookie(response, token);
    return response;
  } catch {
    return internalError();
  }
}

