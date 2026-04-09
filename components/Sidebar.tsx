"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Building2, GraduationCap, BookOpen, CalendarDays, Layers, Compass } from "lucide-react";

const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/departments", label: "Departments", Icon: Building2 },
  { href: "/programs", label: "Programs", Icon: GraduationCap },
  { href: "/courses", label: "Courses", Icon: BookOpen },
  { href: "/terms", label: "Terms & Semesters", Icon: Layers },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-full w-56 flex-col border-r border-border bg-background shadow-sm lg:sticky lg:top-0 lg:h-screen"
      aria-label="Main navigation"
    >
      <div className="flex flex-1 flex-col gap-6 px-3 py-5">
        <div className="rounded-lg border border-slate-300 bg-slate-200/80 px-3 py-2.5">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Compass className="size-4 text-primary" aria-hidden />
            Quick Access
          </p>
          <p className="mt-0.5 text-xs text-slate-600">Academic management</p>
        </div>
        <nav className="flex flex-col gap-1">
          {sidebarItems.map((item) => {
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
                  "rounded-lg px-3 py-2.5 text-base font-medium transition-colors inline-flex items-center gap-2.5",
                  isActive
                    ? "bg-primary/15 text-primary shadow-sm hover:bg-primary/20"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                <item.Icon className="size-[1.05rem] shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

