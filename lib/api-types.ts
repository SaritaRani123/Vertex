/**
 * API type definitions — input and response data.
 * No `any`; all types are explicit for type safety.
 */

// ============== Departments ==============

export interface DepartmentInput {
  name: string;
  code: string;
}

export interface DepartmentResponse {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface DepartmentListResponse {
  data: DepartmentResponse[];
}

// ============== Programs ==============

export type ProgramStatus = "ACTIVE" | "INACTIVE";

export interface ProgramInput {
  name: string;
  code: string;
  duration_years: number;
  status?: ProgramStatus;
  department_id: number;
}

export interface ProgramResponse {
  id: number;
  name: string;
  code: string;
  duration_years: number;
  status: ProgramStatus;
  department_id: number;
  created_at: string;
  updated_at: string;
}

export interface ProgramListResponse {
  data: ProgramResponse[];
}

// ============== Error response (for 400 validation) ==============

export interface ValidationErrorResponse {
  error: string;
  code: "VALIDATION_ERROR";
  details?: Array<{ path: (string | number)[]; message: string }>;
}

export interface ApiErrorResponse {
  error: string;
  code: "NOT_FOUND" | "INTERNAL_ERROR";
}
