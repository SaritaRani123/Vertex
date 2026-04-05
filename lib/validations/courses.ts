import { z } from "zod";
import type { CourseInput } from "@/lib/api-types";

const courseStatusSchema = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);
const courseKindSchema = z.enum(["COMPULSORY", "ELECTIVE"]);

const courseSchema = z
  .object({
    name: z.string().min(1, "Name is required").trim(),
    code: z.string().min(1, "Code is required").trim(),
    description: z
      .string()
      .optional()
      .nullable()
      .transform((v) => v ?? undefined),
    prerequisites: z.array(z.string().trim().min(1)).optional().default([]),
    credits: z.number().int().min(0, "Credits must be >= 0"),
    lecture_hours: z.coerce.number().int().min(0, "Lecture hours must be >= 0").optional(),
    lab_hours: z.coerce.number().int().min(0, "Lab hours must be >= 0").optional(),
    status: courseStatusSchema.optional().default("ACTIVE"),
    program_id: z.coerce.number().int().positive("Invalid program ID").optional(),
    program_semester_id: z.coerce.number().int().positive("Invalid program semester ID").optional(),
    course_kind: courseKindSchema.optional().default("COMPULSORY"),
    elective_group_id: z.coerce.number().int().positive().optional().nullable(),
  })
  .refine((d) => d.program_id !== undefined || d.program_semester_id !== undefined, {
    message: "program_id or program_semester_id is required",
    path: ["program_id"],
  })
  .refine((d) => !d.elective_group_id || d.course_kind === "ELECTIVE", {
    message: "Elective pool applies only to elective courses",
    path: ["elective_group_id"],
  })
  .refine((d) => !d.elective_group_id || d.program_semester_id != null, {
    message: "program_semester_id is required when assigning an elective group",
    path: ["program_semester_id"],
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
  program_semester_id: z.coerce.number().int().positive().nullable().optional(),
  course_kind: courseKindSchema.optional(),
  elective_group_id: z.coerce.number().int().positive().nullable().optional(),
});

export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;

export function safeValidateCourseUpdate(body: unknown) {
  return courseUpdateSchema.safeParse(body);
}
