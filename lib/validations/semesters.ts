import { z } from "zod";
import type { SemesterInput } from "@/lib/api-types";

const semesterTypeSchema = z.enum(["FALL", "WINTER", "SUMMER"]);

const semesterSchema = z.object({
  year: z.number().int().min(1900, "Year must be valid").max(3000, "Year must be valid"),
  type: semesterTypeSchema,
});

export type SemesterCreateInput = z.infer<typeof semesterSchema>;

export function validateSemesterCreate(body: unknown): SemesterInput {
  return semesterSchema.parse(body) as SemesterInput;
}

export function safeValidateSemesterCreate(
  body: unknown
): z.SafeParseReturnType<z.infer<typeof semesterSchema>, SemesterInput> {
  return semesterSchema.safeParse(body);
}

export const semesterUpdateSchema = z.object({
  year: z.number().int().min(1900, "Year must be valid").max(3000, "Year must be valid").optional(),
  type: semesterTypeSchema.optional(),
});

export type SemesterUpdateInput = z.infer<typeof semesterUpdateSchema>;

export function safeValidateSemesterUpdate(body: unknown) {
  return semesterUpdateSchema.safeParse(body);
}
