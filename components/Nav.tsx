"use client";

import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-slate-50/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-slate-50/90">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex flex-col justify-center gap-0.5">
          <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            Programs Scheduling
          </span>
          <span className="text-xs text-muted-foreground sm:text-sm">
            Dashboard
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-up.html"
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-all duration-200 ease-in-out hover:bg-muted active:scale-[0.98]"
          >
            Sign up
          </Link>
          <Link
            href="/sign-in.html"
            className="rounded-md bg-[#3c096c] px-4 py-2 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:bg-[#5a189a] active:scale-[0.98] active:bg-[#450a6e]"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
