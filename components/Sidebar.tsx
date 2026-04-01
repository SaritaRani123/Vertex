"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Building2, GraduationCap, BookOpen, CalendarDays, Layers } from "lucide-react";

const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/departments", label: "Departments", Icon: Building2 },
  { href: "/programs", label: "Programs", Icon: GraduationCap },
  { href: "/courses", label: "Courses", Icon: BookOpen },
  { href: "/semesters", label: "Semesters", Icon: CalendarDays },
  { href: "/terms", label: "Terms", Icon: Layers },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 z-30 flex h-screen w-56 flex-col border-r border-border shadow-sm bg-background"
      aria-label="Main navigation"
    >
      <div className="flex flex-1 flex-col gap-6 px-3 py-5">
        <div className="px-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation
          </h2>
        </div>
        <nav className="flex flex-col gap-1">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors inline-flex items-center gap-2",
                  isActive
                    ? "bg-muted text-foreground shadow-sm hover:bg-muted"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.Icon className="size-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

