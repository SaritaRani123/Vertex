"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Nav } from "@/components/Nav";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/departments", label: "Departments" },
  { href: "/programs", label: "Programs" },
  { href: "/courses", label: "Courses" },
  { href: "/terms", label: "Terms" },
];

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
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      {/* min-w-0: flex item may shrink so wide tables don’t widen the page on small screens. */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Nav />
        <div className="border-b border-border bg-background px-3 py-2 lg:hidden">
          <div className="flex gap-2 overflow-x-auto">
            {mobileNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/") ||
                (item.href === "/terms" &&
                  (pathname === "/semesters" || pathname.startsWith("/semesters/")));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <main className="min-w-0 flex-1 overflow-x-auto px-4 py-6 text-[15px] sm:text-base">
          <div className="container mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
