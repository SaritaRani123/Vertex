export interface Department {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Program {
  id: string;
  name: string;
  duration: number;
  degreeType: string;
  totalCredits: number;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Semester {
  id: string;
  name: string;
  order: number;
  programId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  lectureHours: number;
  labHours: number;
  semesterId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prerequisite {
  id: string;
  subjectId: string;
  dependsOnId: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "Admin" | "User";
