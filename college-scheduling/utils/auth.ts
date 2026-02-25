import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getSession() {
  return getServerSession(authOptions);
}

/** Any authenticated user (Admin or User). */
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 as const };
  }
  return { session };
}

/** Only Admin can mutate; use for POST/PUT/DELETE. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 as const };
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "Admin") {
    return { error: "Forbidden: Admin only", status: 403 as const };
  }
  return { session };
}
