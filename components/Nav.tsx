"use client";

import { useState } from "react";
import Link from "next/link";
import { useSessionUser } from "@/hooks/use-session-user";

export function Nav() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user } = useSessionUser();

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/";
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-slate-50/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-slate-50/90">
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-4 lg:px-6">
        <Link
          href="/dashboard"
          className="flex items-center transition-opacity hover:opacity-90"
        >
          <span className="text-lg font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
            Program Scheduling System
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <span className="hidden rounded-md border border-border bg-muted px-3 py-1.5 text-sm font-medium text-foreground sm:inline-flex sm:text-base">
              {user.name}
            </span>
          ) : (
            <>
              <Link
                href="/sign-up.html"
                className="rounded-md px-2.5 py-1.5 text-sm font-medium text-foreground transition-all duration-200 ease-in-out hover:bg-muted active:scale-[0.98] sm:px-3 sm:py-2 sm:text-base"
              >
                Sign up
              </Link>
              <Link
                href="/sign-in.html"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:bg-primary/90 active:scale-[0.98] active:bg-primary/80 sm:px-4 sm:py-2 sm:text-base"
              >
                Sign in
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-md border border-border px-2.5 py-1.5 text-sm font-medium text-foreground transition-all duration-200 ease-in-out hover:bg-muted disabled:opacity-60 sm:px-3 sm:py-2 sm:text-base"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}

