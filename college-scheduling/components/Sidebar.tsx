"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";

const sidebarItems = [
  { href: "/", label: "Home" },
  { href: "/departments", label: "Departments" },
  { href: "/programs", label: "Programs" },
  { href: "/semesters", label: "Semesters" },
  { href: "/subjects", label: "Subjects" },
  { href: "/prerequisites", label: "Prerequisites" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 z-30 flex h-screen w-56 flex-col border-r border-border shadow-sm"
      style={{ backgroundColor: "#4C1D95" }}
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
                    ? "bg-[#D83F87] text-white shadow-sm hover:bg-[#c23678]"
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
