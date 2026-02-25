import { redirect } from "next/navigation";
import { getSession } from "@/utils/auth";
import Link from "next/link";
import { prisma } from "@/utils/prisma";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  GitBranch,
  Layers3,
} from "lucide-react";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [departmentsCount, programsCount, subjectsCount, prerequisitesCount] =
    await Promise.all([
      prisma.department.count(),
      prisma.program.count(),
      prisma.subject.count(),
      prisma.prerequisite.count(),
    ]);

  const stats = [
    { label: "Total Departments", value: departmentsCount, href: "/departments", accent: "bg-purple-400" },
    { label: "Total Programs", value: programsCount, href: "/programs", accent: "bg-blue-400" },
    { label: "Total Subjects", value: subjectsCount, href: "/subjects", accent: "bg-emerald-400" },
    { label: "Total Prerequisites", value: prerequisitesCount, href: "/prerequisites", accent: "bg-amber-400" },
  ];

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
      icon: Layers3,
    },
    {
      label: "Add Subject",
      href: "/subjects/create",
      description: "Register a subject within a semester.",
      icon: BookOpenCheck,
    },
    {
      label: "Assign Prerequisite",
      href: "/prerequisites",
      description: "Define prerequisite relationships between subjects.",
      icon: GitBranch,
    },
  ];

  const hierarchy = [
    "Department",
    "Program",
    "Semester",
    "Subject",
    "Prerequisite",
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          College Scheduling
        </h1>
        <p className="mt-1 text-muted-foreground">
          Programs Management Module. Use the navigation to manage departments,
          programs, semesters, subjects, and prerequisites.
        </p>
      </div>

      {/* Summary Statistics */}
      <section className="rounded-xl bg-indigo-50/70 px-4 py-5 sm:px-5 sm:py-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Summary Statistics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, href, accent }) => (
            <Link
              key={href}
              href={href}
              className="relative overflow-hidden rounded-lg border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className={`absolute left-0 right-0 top-0 h-1 ${accent} opacity-70`} aria-hidden />
              <p className="text-sm font-medium text-muted-foreground">
                {label}
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
                {value}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Academic Structure Overview */}
      <section className="rounded-xl bg-slate-50/80 px-4 py-5 sm:px-5 sm:py-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Academic Structure Overview
        </h2>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {hierarchy.map((item, i) => (
              <span key={item} className="flex items-center gap-2 sm:gap-3">
                <span className="rounded-md bg-[#4C1D95]/10 px-3 py-1.5 text-sm font-medium text-foreground">
                  {item}
                </span>
                {i < hierarchy.length - 1 && (
                  <span
                    className="text-muted-foreground"
                    aria-hidden
                  >
                    →
                  </span>
                )}
              </span>
            ))}
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            This module maintains the official academic hierarchy used by the
            College Scheduling System. All scheduling, faculty assignment, and
            facility allocation depend on this validated structure.
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="rounded-xl border border-border bg-white px-4 py-5 shadow-sm sm:px-5 sm:py-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Perform common administrative tasks quickly.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ label, href, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex h-full flex-col justify-between rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-200 hover:bg-purple-50/70 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-purple-50 p-2 text-purple-700">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {label}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-medium text-purple-700">
                <span>Go to action</span>
                <ArrowRight className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
