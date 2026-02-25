"use client";

import Link from "next/link";

export function AuthHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center px-4">
        <Link
          href="/"
          className="text-lg font-semibold text-foreground hover:text-primary"
        >
          College Scheduling
        </Link>
      </div>
    </header>
  );
}
