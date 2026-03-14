// API request/response types (see docs/API_SPECIFICATION.md)

// Departments

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

// Programs

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

export interface ProgramListItem extends ProgramResponse {
  department_name: string;
}

export interface ProgramListResponse {
  data: ProgramListItem[];
}

// Courses

export type CourseStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface CourseInput {
  name: string;
  code: string;
  description?: string;
  prerequisites?: string[];
  credits: number;
  lecture_hours: number;
  lab_hours: number;
  status?: CourseStatus;
  program_id: number;
}

export interface CourseResponse {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  prerequisites: string[];
  credits: number;
  lecture_hours: number;
  lab_hours: number;
  status: CourseStatus;
  program_id: number;
  program_name: string;
  created_at: string;
  updated_at: string;
}

export interface CourseListResponse {
  data: CourseResponse[];
}

// Semesters

export type SemesterType = "FALL" | "WINTER" | "SUMMER";

export interface SemesterInput {
  year: number;
  type: SemesterType;
}

export interface SemesterResponse {
  id: number;
  year: number;
  type: SemesterType;
  created_at: string;
  updated_at: string;
}

export interface SemesterListResponse {
  data: SemesterResponse[];
}

// Terms

export interface TermInput {
  semester_id: number;
  course_id: number;
}

export interface TermResponse {
  id: number;
  semester_id: number;
  course_id: number;
  created_at: string;
}

export interface TermListResponse {
  data: Array<TermResponse & { semester_year: number; semester_type: SemesterType; course_name: string; course_code: string }>;
}

// Error responses

export interface ValidationErrorResponse {
  error: string;
  code: "VALIDATION_ERROR";
  details?: Array<{ path: (string | number)[]; message: string }>;
}

export interface ApiErrorResponse {
  error: string;
  code: "NOT_FOUND" | "INTERNAL_ERROR";
}
