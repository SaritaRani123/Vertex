"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Nav() {
  const { data: session, status } = useSession();

  const role = (session?.user as { role?: string } | undefined)?.role ?? "User";
  const isAdmin = role.toLowerCase() === "admin";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-slate-50/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-slate-50/90">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex flex-col justify-center gap-0.5">
          <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            College Scheduling
          </span>
          <span className="text-xs text-muted-foreground sm:text-sm">
            Programs Management Dashboard
          </span>
        </div>
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <span className="text-sm text-muted-foreground">...</span>
          ) : session ? (
            <>
              <div className="hidden items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex">
                <span className="text-sm text-muted-foreground">
                  {session.user?.email}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium text-white ${
                    isAdmin ? "bg-purple-600" : "bg-slate-500"
                  }`}
                >
                  {role}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/signup">Sign up</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
