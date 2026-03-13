import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, GraduationCap } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Programs Scheduling System
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              Departments
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage departments and view department list
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/departments">View Departments</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="size-5" />
              Programs
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage academic programs by department
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/programs">View Programs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="size-5" />
              Courses
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage courses and assign to programs
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/courses">View Courses</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="size-5" />
              Semesters
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage semester periods
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/semesters">View Semesters</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="size-5" />
              Terms
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Assign courses to semesters (terms)
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/terms">View Terms</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
