import { z } from "zod";
import type { CourseInput } from "@/lib/api-types";

const courseStatusSchema = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);

const courseSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  code: z.string().min(1, "Code is required").trim(),
  description: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? undefined),
  prerequisites: z.array(z.string().trim().min(1)).optional().default([]),
  credits: z.number().int().min(0, "Credits must be >= 0"),
  lecture_hours: z.number().int().min(0, "Lecture hours must be >= 0"),
  lab_hours: z.number().int().min(0, "Lab hours must be >= 0"),
  status: courseStatusSchema.optional().default("ACTIVE"),
  program_id: z.coerce.number().int().positive("Invalid program ID"),
});

export type CourseCreateInput = z.infer<typeof courseSchema>;

export function validateCourseCreate(body: unknown): CourseInput {
  return courseSchema.parse(body) as CourseInput;
}

export function safeValidateCourseCreate(
  body: unknown
): z.SafeParseReturnType<z.infer<typeof courseSchema>, CourseInput> {
  return courseSchema.safeParse(body);
}

export const courseUpdateSchema = z.object({
  name: z.string().min(1).trim().optional(),
  code: z.string().min(1).trim().optional(),
  description: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? undefined),
  prerequisites: z.array(z.string().trim().min(1)).optional(),
  credits: z.number().int().min(0).optional(),
  lecture_hours: z.number().int().min(0).optional(),
  lab_hours: z.number().int().min(0).optional(),
  status: courseStatusSchema.optional(),
  program_id: z.coerce.number().int().positive().optional(),
});

export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;

export function safeValidateCourseUpdate(body: unknown) {
  return courseUpdateSchema.safeParse(body);
}
