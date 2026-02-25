"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Sidebar } from "@/components/Sidebar";

const AUTH_PATHS = ["/login", "/signup"];

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_PATHS.includes(pathname);

  if (isAuth) {
    return <div className="flex min-h-screen flex-col">{children}</div>;
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
