"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { href: "/", label: "Dashboard" },
  { href: "/departments", label: "Departments" },
  { href: "/programs", label: "Programs" },
  { href: "/courses", label: "Courses" },
  { href: "/semesters", label: "Semesters" },
  { href: "/terms", label: "Terms" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 z-30 flex h-screen w-56 flex-col border-r border-border shadow-sm"
      style={{ backgroundColor: "#3c096c" }}
      aria-label="Main navigation"
    >
      <div className="flex flex-1 flex-col gap-6 px-3 py-5">
        <div className="px-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/80">
            Navigation
          </h2>
        </div>
        <nav className="flex flex-col gap-1">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#5a189a] text-white shadow-sm hover:bg-[#6b21a8]"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
