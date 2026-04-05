"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Nav } from "@/components/Nav";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return (
      <div className="min-h-screen bg-background text-foreground">{children}</div>
    );
  }

  return (
    <div className="flex min-h-screen w-full min-w-0">
      <Sidebar />
      {/* min-w-0: flex item may shrink so wide tables don’t widen the page (fixes sticky header vs fixed sidebar on horizontal scroll). */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col pl-56">
        <Nav />
        <main className="min-w-0 flex-1 overflow-x-auto px-4 py-6">
          <div className="container mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
