"use client";

import { useState } from "react";
import Link from "next/link";

export function Nav() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <Link
          href="/dashboard"
          className="flex flex-col justify-center gap-0.5 transition-opacity hover:opacity-90"
        >
          <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            Program Scheduling System
          </span>
          <span className="text-xs text-muted-foreground sm:text-sm">
            Dashboard
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-up.html"
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-all duration-200 ease-in-out hover:bg-muted active:scale-[0.98]"
          >
            Sign up
          </Link>
          <Link
            href="/sign-in.html"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:bg-primary/90 active:scale-[0.98] active:bg-primary/80"
          >
            Sign in
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-all duration-200 ease-in-out hover:bg-muted disabled:opacity-60"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}

