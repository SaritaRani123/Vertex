import Link from "next/link";
import { prisma } from "@/lib/db";
import { ArrowRight, BookOpen, Building2, CalendarDays, GraduationCap, Layers } from "lucide-react";

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
              className="group relative flex h-full flex-col justify-between rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/10 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
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
              <div className="mt-4 flex items-center text-xs font-medium text-primary">
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

