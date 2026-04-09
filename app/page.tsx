import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Program Scheduling System",
  description:
    "Efficiently manage and organize program schedules. Plan sessions, track timelines, and streamline your workflow.",
};

const features = [
  {
    title: "Departments & programs",
    description:
      "Organize academic units and programs in one hierarchy so everyone sees the same structure.",
    icon: Building2,
    accent: "bg-primary/15 text-primary",
  },
  {
    title: "Courses & prerequisites",
    description:
      "Track credits, hours, and prerequisite chains so scheduling stays coherent term to term.",
    icon: BookOpen,
    accent: "bg-cyan-100 text-cyan-700",
  },
  {
    title: "Semesters & terms",
    description:
      "Plan which courses run in which semester and keep timelines aligned across the year.",
    icon: CalendarDays,
    accent: "bg-slate-100 text-slate-700",
  },
] as const;

const highlights = [
  {
    title: "One workspace",
    body: "Departments through terms in a single app—no scattered spreadsheets.",
  },
  {
    title: "Role-aware",
    body: "Admins move fast; staff follow your approval workflow.",
  },
  {
    title: "Built for clarity",
    body: "Validation and clear errors keep data clean at the source.",
  },
  {
    title: "Ready when you are",
    body: "Sign up in seconds and land on your dashboard.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            Program Scheduling System
          </span>
          <nav className="flex items-center gap-2 sm:gap-3" aria-label="Account">
            <Link
              href="/sign-in.html"
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up.html"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-cyan-100 via-cyan-50 to-background dark:from-cyan-950/25">
          <div className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="mx-auto max-w-7xl px-4 py-14 sm:py-18 lg:px-8 lg:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div className="space-y-6">
                <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
                  <Sparkles className="mr-1 size-3.5" aria-hidden />
                  Scheduling made simple
                </Badge>
                <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Run programs, courses, and terms without the chaos
                </h1>
                <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
                  Efficiently manage and organize program schedules with one connected workspace.
                  Plan sessions, track timelines, and streamline your workflow.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild size="lg" className="px-6">
                    <Link href="/sign-up.html">
                      Get Started
                      <ArrowRight className="ml-1 size-4" aria-hidden />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/sign-in.html">Sign In</Link>
                  </Button>
                </div>
              </div>

              <div className="mx-auto w-full max-w-xl lg:max-w-none">
                <div className="overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-[0_18px_44px_-22px_rgba(0,0,0,0.35)]">
                  <Image
                    src="/images/landing-page.png"
                    alt="Illustration of a team managing a digital calendar and program schedule"
                    width={960}
                    height={640}
                    className="h-auto w-full rounded-xl object-contain"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Departments → Programs → Courses → Semesters → Terms
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 lg:py-18">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything you need to <span className="text-primary">stay organized</span>
              </h2>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                Core modules work together so your team always works from the same plan.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ title, description, icon: Icon, accent }) => (
                <Card
                  key={title}
                  className="border border-border/70 bg-card/95 shadow-[0_5px_20px_-16px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-20px_rgba(8,145,178,0.35)]"
                >
                  <CardHeader>
                    <div className={`mb-2 flex size-12 items-center justify-center rounded-xl ${accent}`}>
                      <Icon className="size-6" aria-hidden />
                    </div>
                    <CardTitle className="text-xl">{title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border/60 bg-muted/35 py-14 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Why teams use this app
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map(({ title, body }) => (
                <Card key={title} size="sm" className="border border-border/70 bg-card">
                  <CardContent className="pt-6">
                    <div className="mb-3 h-1 w-10 rounded-full bg-gradient-to-r from-primary to-cyan-400" />
                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full border-y border-border/50 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 py-14">
          <div className="mx-auto max-w-5xl px-4 text-center lg:px-8">
            <GraduationCap className="mx-auto size-10 opacity-90" aria-hidden />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-black sm:text-3xl">
              Ready to simplify your scheduling?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-black/90 sm:text-lg">
              Create an account and open your dashboard in moments.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="px-8">
                <Link href="/sign-up.html">
                  Get Started
                  <ArrowRight className="ml-1 size-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
