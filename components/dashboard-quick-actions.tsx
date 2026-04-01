"use client";

import { BookOpen, Building2, CalendarDays, GraduationCap, Layers } from "lucide-react";
import { QuickActionCard } from "@/components/guarded-quick-action-card";
import { useStaffActionGuard } from "@/hooks/use-staff-action-guard";

const quickActions = [
  {
    label: "Add Department",
    href: "/departments/create",
    description: "Add a new academic department.",
    icon: Building2,
  },
  {
    label: "Create Program",
    href: "/programs/create",
    description: "Create a program under a department.",
    icon: GraduationCap,
  },
  {
    label: "Add Course",
    href: "/courses/create",
    description: "Register a course within a program.",
    icon: BookOpen,
  },
  {
    label: "Add Semester",
    href: "/semesters/create",
    description: "Create a new semester period.",
    icon: CalendarDays,
  },
  {
    label: "Assign Term",
    href: "/terms/create",
    description: "Assign a course to a semester term.",
    icon: Layers,
  },
] as const;

export function DashboardQuickActions() {
  const { guardAction, blockedDialog, sessionLoading } = useStaffActionGuard();

  return (
    <section className="rounded-xl border border-border bg-white px-4 py-5 shadow-sm sm:px-5 sm:py-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Perform common administrative tasks quickly.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map(({ label, href, description, icon }) => (
          <QuickActionCard
            key={href}
            href={href}
            label={label}
            description={description}
            icon={icon}
            guardAction={guardAction}
            sessionLoading={sessionLoading}
          />
        ))}
      </div>
      {blockedDialog}
    </section>
  );
}
