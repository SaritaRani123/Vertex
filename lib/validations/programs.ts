import { z } from "zod";
import type { ProgramInput } from "@/lib/api-types";

const programStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

const programSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  code: z.string().min(1, "Code is required").trim().optional(),
  duration_years: z.number().int().min(1, "Duration must be at least 1 year"),
  status: programStatusSchema.optional().default("ACTIVE"),
  department_id: z.coerce.number().int().positive("Invalid department ID"),
});

export type ProgramCreateInput = z.infer<typeof programSchema>;

export function validateProgramCreate(body: unknown): ProgramInput {
  return programSchema.parse(body) as ProgramInput;
}

export function safeValidateProgramCreate(
  body: unknown
): z.SafeParseReturnType<z.infer<typeof programSchema>, ProgramInput> {
  return programSchema.safeParse(body);
}

export const programUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").trim().optional(),
  code: z.string().min(1, "Code is required").trim().optional(),
  duration_years: z.number().int().min(1, "Duration must be at least 1 year").optional(),
  status: programStatusSchema.optional(),
  department_id: z.coerce.number().int().positive("Invalid department ID").optional(),
});

export type ProgramUpdateInput = z.infer<typeof programUpdateSchema>;

export function safeValidateProgramUpdate(body: unknown) {
  return programUpdateSchema.safeParse(body);
}
