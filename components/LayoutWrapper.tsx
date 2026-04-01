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
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col pl-56">
        <Nav />
        <main className="flex-1 px-4 py-6">
          <div className="container mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
