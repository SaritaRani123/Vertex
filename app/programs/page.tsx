import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Plus } from "lucide-react";

// Static mock data - replace with prisma.programs.findMany({ include: { department: true } })
const MOCK_PROGRAMS = [
  { id: "1", name: "B.Tech Computer Science", code: "BTCS", duration_years: 4, status: "ACTIVE" as const, department: { name: "Computer Science" } },
  { id: "2", name: "B.Tech Electrical", code: "BTEE", duration_years: 4, status: "ACTIVE" as const, department: { name: "Electrical Engineering" } },
  { id: "3", name: "M.Tech CSE", code: "MTCS", duration_years: 2, status: "INACTIVE" as const, department: { name: "Computer Science" } },
];

export default function ProgramsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Programs</h1>
          <p className="text-muted-foreground">
            View and manage academic programs
          </p>
        </div>
        <Button asChild>
          <Link href="/programs/create" className="flex items-center gap-2">
            <Plus className="size-4" />
            Add Program
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">All Programs</h2>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_PROGRAMS.map((prog) => (
                <TableRow key={prog.id}>
                  <TableCell className="font-medium">{prog.code}</TableCell>
                  <TableCell>{prog.name}</TableCell>
                  <TableCell>{prog.department.name}</TableCell>
                  <TableCell>{prog.duration_years} years</TableCell>
                  <TableCell>
                    <Badge variant={prog.status === "ACTIVE" ? "default" : "secondary"}>
                      {prog.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/programs/${prog.id}/edit`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
