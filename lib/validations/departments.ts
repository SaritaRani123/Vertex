import { z } from "zod";
import type { DepartmentInput } from "@/lib/api-types";

const departmentSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  code: z.string().min(1, "Code is required").trim(),
});

export type DepartmentCreateInput = z.infer<typeof departmentSchema>;

export function validateDepartmentCreate(body: unknown): DepartmentInput {
  return departmentSchema.parse(body) as DepartmentInput;
}

export function safeValidateDepartmentCreate(
  body: unknown
): z.SafeParseReturnType<z.infer<typeof departmentSchema>, DepartmentInput> {
  return departmentSchema.safeParse(body);
}

export const departmentUpdateSchema = departmentSchema.partial();

export type DepartmentUpdateInput = z.infer<typeof departmentUpdateSchema>;

export function safeValidateDepartmentUpdate(body: unknown) {
  return departmentUpdateSchema.safeParse(body);
}
