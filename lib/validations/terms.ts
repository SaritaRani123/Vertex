import { z } from "zod";
import type { TermInput } from "@/lib/api-types";

const termSchema = z.object({
  semester_id: z.coerce.number().int().positive("Invalid semester ID"),
  course_id: z.coerce.number().int().positive("Invalid course ID"),
});

export type TermCreateInput = z.infer<typeof termSchema>;

export function validateTermCreate(body: unknown): TermInput {
  return termSchema.parse(body) as TermInput;
}

export function safeValidateTermCreate(
  body: unknown
): z.SafeParseReturnType<z.infer<typeof termSchema>, TermInput> {
  return termSchema.safeParse(body);
}

export const termUpdateSchema = z.object({
  semester_id: z.coerce.number().int().positive().optional(),
  course_id: z.coerce.number().int().positive().optional(),
});

export type TermUpdateInput = z.infer<typeof termUpdateSchema>;

export function safeValidateTermUpdate(body: unknown) {
  return termUpdateSchema.safeParse(body);
}
