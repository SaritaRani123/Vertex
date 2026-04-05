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
  /** Omit to auto-generate a unique code from the program name. */
  code?: string;
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
  department_name: string;
  created_at: string;
  updated_at: string;
}

/** List rows use the same shape as {@link ProgramResponse} (department name from the API join). */
export type ProgramListItem = ProgramResponse;

export interface ProgramListResponse {
  data: ProgramListItem[];
}

/** Curriculum wizard: program-owned semesters (sequence 1..N) and nested courses. */
export interface CurriculumElectiveGroupResponse {
  id: number;
  choose_count: number;
  label: string | null;
  course_count: number;
}

export interface CurriculumSemesterResponse {
  id: number;
  sequence: number;
  elective_groups: CurriculumElectiveGroupResponse[];
  courses: CourseResponse[];
}

export interface ProgramCurriculumResponse {
  program: ProgramResponse;
  semesters: CurriculumSemesterResponse[];
}

// Courses

export type CourseStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type CourseKind = "COMPULSORY" | "ELECTIVE";

export interface CourseInput {
  name: string;
  code: string;
  description?: string;
  prerequisites?: string[];
  credits: number;
  lecture_hours?: number;
  lab_hours?: number;
  status?: CourseStatus;
  /** Required unless program_semester_id is set. */
  program_id?: number;
  /** When set, course is placed in this curriculum semester; program_id is derived from it. */
  program_semester_id?: number;
  course_kind?: CourseKind;
  elective_group_id?: number | null;
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
  program_semester_id: number | null;
  /** Curriculum semester number within the program (1…N), when assigned. */
  program_semester_sequence: number | null;
  course_kind: CourseKind;
  elective_group_id: number | null;
  /** Label from elective pool, when the course belongs to a pool. */
  elective_group_label: string | null;
  /** "Choose K" count for the elective pool, when applicable. */
  elective_choose_count: number | null;
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
  code: "NOT_FOUND" | "INTERNAL_ERROR" | "UNAUTHORIZED" | "FORBIDDEN";
}
