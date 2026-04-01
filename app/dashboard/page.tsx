import Link from "next/link";
import { prisma } from "@/lib/db";
import { DashboardQuickActions } from "@/components/dashboard-quick-actions";

export default async function DashboardPage() {
  const [departmentsCount, programsCount, coursesCount, semestersCount, termsCount] =
    await Promise.all([
      prisma.departments.count(),
      prisma.programs.count(),
      prisma.courses.count(),
      prisma.semesters.count(),
      prisma.terms.count(),
    ]);

  const stats = [
    { label: "Total Departments", value: departmentsCount, href: "/departments", accent: "bg-primary" },
    { label: "Total Programs", value: programsCount, href: "/programs", accent: "bg-blue-400" },
    { label: "Total Courses", value: coursesCount, href: "/courses", accent: "bg-emerald-400" },
    { label: "Total Semesters", value: semestersCount, href: "/semesters", accent: "bg-amber-400" },
    { label: "Total Terms", value: termsCount, href: "/terms", accent: "bg-rose-400" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Programs Scheduling
        </h1>
        <p className="mt-1 text-muted-foreground">
          Programs Management Module. Use the navigation to manage departments,
          programs, courses, semesters, and terms.
        </p>
      </div>

      {/* Summary Statistics */}
      <section className="rounded-xl bg-indigo-50/70 px-4 py-5 sm:px-5 sm:py-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Summary Statistics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

      <DashboardQuickActions />
    </div>
  );
}
