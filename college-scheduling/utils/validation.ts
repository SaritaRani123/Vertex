import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
});

export const programSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  duration: z.number().int().min(1).max(20),
  degreeType: z.string().min(1, "Degree type is required").max(100),
  totalCredits: z.number().int().min(0),
  departmentId: z.string().uuid(),
});

export const semesterSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  order: z.number().int().min(1),
  programId: z.string().uuid(),
});

export const subjectSchema = z.object({
  code: z.string().min(1, "Code is required").max(20),
  name: z.string().min(1, "Name is required").max(200),
  credits: z.number().int().min(0).max(30),
  lectureHours: z.number().int().min(0).max(100),
  labHours: z.number().int().min(0).max(100),
  semesterId: z.string().uuid(),
});

export const prerequisiteSchema = z.object({
  subjectId: z.string().uuid(),
  dependsOnId: z.string().uuid(),
}).refine((data) => data.subjectId !== data.dependsOnId, {
  message: "Subject cannot depend on itself",
  path: ["dependsOnId"],
});

export type DepartmentInput = z.infer<typeof departmentSchema>;
export type ProgramInput = z.infer<typeof programSchema>;
export type SemesterInput = z.infer<typeof semesterSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type PrerequisiteInput = z.infer<typeof prerequisiteSchema>;
