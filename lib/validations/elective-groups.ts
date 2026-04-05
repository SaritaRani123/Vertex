import { z } from "zod";

const electiveGroupCreateSchema = z.object({
  choose_count: z.coerce.number().int().min(1, "Choose at least 1 course from the pool"),
  label: z
    .string()
    .trim()
    .max(120)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export type ElectiveGroupCreateInput = z.infer<typeof electiveGroupCreateSchema>;

export function safeValidateElectiveGroupCreate(body: unknown) {
  return electiveGroupCreateSchema.safeParse(body);
}
