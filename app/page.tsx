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
    accent: "bg-chart-1/15 text-chart-4",
  },
  {
    title: "Courses & prerequisites",
    description:
      "Track credits, hours, and prerequisite chains so scheduling stays coherent term to term.",
    icon: BookOpen,
    accent: "bg-chart-2/15 text-chart-5",
  },
  {
    title: "Semesters & terms",
    description:
      "Plan which courses run in which semester and keep timelines aligned across the year.",
    icon: CalendarDays,
    accent: "bg-chart-3/15 text-primary",
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
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            Program Scheduling System
          </span>
          <nav className="flex items-center gap-2 sm:gap-3" aria-label="Account">
            <Link
              href="/sign-in.html"
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted active:scale-[0.98]"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up.html"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-chart-5/30 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:px-8 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-6">
                <Badge
                  variant="secondary"
                  className="border-0 bg-white/15 text-primary-foreground hover:bg-white/20"
                >
                  <Sparkles className="mr-1 size-3.5" aria-hidden />
                  Scheduling made simple
                </Badge>
                <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Run programs, courses, and terms—without the chaos
                </h1>
                <p className="max-w-xl text-lg text-primary-foreground/90 sm:text-xl">
                  Efficiently manage and organize program schedules with ease. Plan sessions,
                  track timelines, and streamline your workflow in one place.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    asChild
                    size="lg"
                    className="border-0 bg-amber-500 px-6 text-white shadow-md hover:bg-amber-600"
                  >
                    <Link href="/sign-up.html">
                      Get Started
                      <ArrowRight className="ml-1 size-4" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </div>
              {/* Hero illustration */}
              <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
                <div className="overflow-hidden rounded-2xl border border-white/30 bg-white/95 p-2 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] ring-1 ring-white/20">
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
                <p className="mt-4 text-center text-sm text-primary-foreground/85">
                  Departments → Programs → Courses → Semesters → Terms
                </p>
              </div>
            </div>
          </div>
          {/* Soft blend into next section (no hard line) */}
          <div
            className="h-14 bg-gradient-to-b from-primary via-primary/65 to-muted/50 sm:h-20"
            aria-hidden
          />
        </section>

        {/* Features */}
        <section className="border-b border-border/60 bg-muted/40 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything you need to{" "}
                <span className="text-primary">stay organized</span>
              </h2>
              <p className="mt-3 text-muted-foreground">
                Core modules work together so your team always works from the same plan.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ title, description, icon: Icon, accent }) => (
                <Card
                  key={title}
                  className="border border-border/50 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]"
                >
                  <CardHeader>
                    <div
                      className={`mb-2 flex size-12 items-center justify-center rounded-xl ${accent}`}
                    >
                      <Icon className="size-6" aria-hidden />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Highlight grid */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Why teams use this app
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map(({ title, body }) => (
                <Card
                  key={title}
                  size="sm"
                  className="border border-border/50 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)]"
                >
                  <CardContent className="pt-6">
                    <div className="mb-3 h-1 w-10 rounded-full bg-primary" />
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band — warm accent like reference */}
        <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-14 text-white shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.06)]">
          <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
            <GraduationCap className="mx-auto size-10 opacity-90" aria-hidden />
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to simplify your scheduling?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-white/90">
              Create an account and open your dashboard in moments—no extra setup required.
            </p>
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="border-0 bg-white px-8 text-orange-600 shadow-lg hover:bg-white/95"
              >
                <Link href="/sign-up.html">
                  Get Started free
                  <ArrowRight className="ml-1 size-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/60 bg-background py-8">
          <p className="text-center text-sm text-muted-foreground">
            Done by Sarita, Sonali, Bhakti.
          </p>
        </footer>
      </main>
    </div>
  );
}
