"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type CourseOption = {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  credits?: number;
  lecture_hours?: number;
  lab_hours?: number;
  status?: string;
  program_name?: string;
};

export type CourseMultiSelectProps = {
  selectedCourses: number[];
  onChange: (ids: number[]) => void;
  /** Pre-loaded courses (skips fetch). */
  courses?: CourseOption[];
  /** Exclude this course id (e.g. when editing — can't be own prerequisite). */
  excludeCourseId?: number;
};

export function CourseMultiSelect({
  selectedCourses,
  onChange,
  courses: coursesProp,
  excludeCourseId,
}: CourseMultiSelectProps) {
  const [fetchedCourses, setFetchedCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(coursesProp === undefined);
  const [search, setSearch] = useState("");

  const allCourses = coursesProp ?? fetchedCourses;
  const courses = useMemo(
    () =>
      excludeCourseId != null
        ? allCourses.filter((c) => c.id !== excludeCourseId)
        : allCourses,
    [allCourses, excludeCourseId]
  );

  useEffect(() => {
    if (coursesProp !== undefined) return;
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses");
        if (!res.ok) return;
        const json = await res.json();
        const data = json.data ?? [];
        setFetchedCourses(
          data.map((c: { id: number; name: string; code: string; description?: string | null; credits?: number; lecture_hours?: number; lab_hours?: number; status?: string; program_name?: string }) => ({
            id: c.id,
            name: c.name,
            code: c.code,
            description: c.description ?? undefined,
            credits: c.credits,
            lecture_hours: c.lecture_hours,
            lab_hours: c.lab_hours,
            status: c.status,
            program_name: c.program_name,
          }))
        );
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, [coursesProp]);

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return courses;
    const q = search.trim().toLowerCase();
    return courses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [courses, search]);

  const selectedSet = useMemo(
    () => new Set(selectedCourses),
    [selectedCourses]
  );

  const selectedCourseOptions = useMemo(
    () => allCourses.filter((c) => selectedSet.has(c.id)),
    [allCourses, selectedSet]
  );

  function toggleCourse(id: number) {
    if (selectedSet.has(id)) {
      onChange(selectedCourses.filter((x) => x !== id));
    } else {
      onChange([...selectedCourses, id]);
    }
  }

  function CourseTooltipContent({ c }: { c: CourseOption }) {
    return (
      <div className="space-y-1.5">
        <div className="font-medium">{c.name}</div>
        <div className="text-muted-foreground text-xs">{c.code}</div>
        {c.description != null && c.description !== "" && (
          <p className="text-muted-foreground text-xs">{c.description}</p>
        )}
        <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
          {c.credits != null && <span>Credits: {c.credits}</span>}
          {c.lecture_hours != null && <span>Lecture: {c.lecture_hours}h</span>}
          {c.lab_hours != null && <span>Lab: {c.lab_hours}h</span>}
          {c.status != null && <span>Status: {c.status}</span>}
          {c.program_name != null && c.program_name !== "" && (
            <span>Program: {c.program_name}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "border-input dark:bg-input/30 flex min-h-8 w-full flex-wrap items-center gap-1.5 rounded-lg border bg-transparent px-2.5 py-2 text-sm transition-colors",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 outline-none",
          "hover:border-input/80"
        )}
      >
        {selectedCourseOptions.length > 0 ? (
          selectedCourseOptions.map((c) => (
            <Tooltip key={c.id} delayMs={300}>
              <TooltipTrigger>
                <Badge
                  variant="secondary"
                  className="font-normal cursor-default"
                >
                  {c.name}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <CourseTooltipContent c={c} />
              </TooltipContent>
            </Tooltip>
          ))
        ) : (
          <span className="text-muted-foreground">
            Select prerequisite courses
          </span>
        )}
        <ChevronDownIcon className="text-muted-foreground ml-auto size-4 shrink-0" />
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="p-0">
        <Command className="rounded-lg border-0 shadow-none">
          <CommandInput
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <CommandList>
            {loading ? (
              <div className="text-muted-foreground py-4 text-center text-sm">
                Loading…
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-muted-foreground py-4 text-center text-sm">
                No courses found.
              </div>
            ) : (
              filteredCourses.map((course) => (
                <Tooltip key={course.id} delayMs={400}>
                  <TooltipTrigger className="w-full">
                    <CommandItem
                      onSelect={() => toggleCourse(course.id)}
                      className="gap-2"
                    >
                      <Checkbox
                        checked={selectedSet.has(course.id)}
                        onCheckedChange={() => toggleCourse(course.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="flex-1">{course.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {course.code}
                      </span>
                    </CommandItem>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <CourseTooltipContent c={course} />
                  </TooltipContent>
                </Tooltip>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
