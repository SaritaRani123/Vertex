"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import type {
  ProgramResponse,
} from "@/lib/api-types";
import type { CourseOption } from "@/components/course-multi-select";
import { CourseMultiSelect } from "@/components/course-multi-select";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { filterDigitsOnly, normalizeUnsignedIntString } from "@/lib/digits-input";

export type ProgramSemesterCourseFormProps = {
  program: ProgramResponse;
  semesterId: number;
  /** Called after a successful save (to refresh curriculum). */
  onReloadCurriculum: () => Promise<void>;
  /** Optional extra callback after a new course is saved. */
  onSaved?: () => void;
  /** Prefix for HTML ids (avoid clashes if multiple instances). */
  fieldIdPrefix?: string;
};

/**
 * Full "new course" form for a program semester — same fields as Create course + curriculum placement.
 * Used by the curriculum wizard and the program detail "Add course" dialog.
 */
export function ProgramSemesterCourseForm({
  program,
  semesterId,
  onReloadCurriculum,
  onSaved,
  fieldIdPrefix = "psc",
}: ProgramSemesterCourseFormProps) {
  const p = fieldIdPrefix;

  const [coursesCatalog, setCoursesCatalog] = useState<CourseOption[]>([]);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [prerequisiteIds, setPrerequisiteIds] = useState<number[]>([]);
  const [creditsStr, setCreditsStr] = useState("3");
  const [lectureHoursStr, setLectureHoursStr] = useState("2");
  const [labHoursStr, setLabHoursStr] = useState("0");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "ARCHIVED">("ACTIVE");

  const [courseKind, setCourseKind] = useState<"COMPULSORY" | "ELECTIVE">("COMPULSORY");

  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savingCourse, setSavingCourse] = useState(false);

  const refreshCatalog = useCallback(async () => {
    try {
      const res = await fetch("/api/courses");
      if (!res.ok) return;
      const json = await res.json();
      const data = json.data ?? [];
      setCoursesCatalog(
        data.map(
          (c: {
            id: number;
            name: string;
            code: string;
            description?: string | null;
            credits?: number;
            lecture_hours?: number;
            lab_hours?: number;
            status?: string;
            program_name?: string;
          }) => ({
            id: c.id,
            name: c.name,
            code: c.code,
            description: c.description ?? undefined,
            credits: c.credits,
            lecture_hours: c.lecture_hours,
            lab_hours: c.lab_hours,
            status: c.status,
            program_name: c.program_name,
          })
        )
      );
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  const resetForm = () => {
    setName("");
    setCode("");
    setDescription("");
    setPrerequisiteIds([]);
    setCreditsStr("3");
    setLectureHoursStr("2");
    setLabHoursStr("0");
    setStatus("ACTIVE");
    setCourseKind("COMPULSORY");
    setFormError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();
    const errors: Record<string, string> = {};
    if (!trimmedName) errors.name = "Name is required";
    if (!trimmedCode) errors.code = "Code is required";

    const credits =
      creditsStr.trim() === "" ? NaN : parseInt(creditsStr, 10);
    const lectureHours =
      lectureHoursStr.trim() === "" ? NaN : parseInt(lectureHoursStr, 10);
    const labHours = labHoursStr.trim() === "" ? NaN : parseInt(labHoursStr, 10);
    if (Number.isNaN(credits)) errors.credits = "Enter credits (0 or more)";
    else if (credits < 0) errors.credits = "Credits must be 0 or more";
    if (Number.isNaN(lectureHours)) errors.lecture_hours = "Enter lecture hours (0 or more)";
    else if (lectureHours < 0) errors.lecture_hours = "Lecture hours must be 0 or more";
    if (Number.isNaN(labHours)) errors.lab_hours = "Enter lab hours (0 or more)";
    else if (labHours < 0) errors.lab_hours = "Lab hours must be 0 or more";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError("Please fix the errors below.");
      return;
    }

    const prerequisiteCodes = prerequisiteIds
      .map((id) => coursesCatalog.find((c) => c.id === id)?.code)
      .filter((c): c is string => Boolean(c));

    setSavingCourse(true);
    setFormError(null);
    try {
      const body: Record<string, unknown> = {
        name: trimmedName,
        code: trimmedCode,
        description: description.trim() || null,
        prerequisites: prerequisiteCodes,
        credits,
        lecture_hours: lectureHours,
        lab_hours: labHours,
        status,
        program_semester_id: semesterId,
        course_kind: courseKind,
      };
      const res = await fetch("/api/courses", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data?.error ?? "Could not save course");
        const details = data?.details as Array<{ path: (string | number)[]; message: string }> | undefined;
        if (details?.length) {
          const byField: Record<string, string> = {};
          for (const d of details) {
            const key = String(d.path[0] ?? "");
            if (key && !byField[key]) byField[key] = d.message;
          }
          setFieldErrors(byField);
        }
        return;
      }
      resetForm();
      await onReloadCurriculum();
      await refreshCatalog();
      onSaved?.();
    } catch {
      setFormError("Something went wrong");
    } finally {
      setSavingCourse(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-medium">Course details</h3>
      </div>
      {formError ? <p className="text-destructive text-sm">{formError}</p> : null}
      <FieldGroup>
        <Field data-invalid={!!fieldErrors.name}>
          <FieldLabel htmlFor={`${p}-name`}>Name</FieldLabel>
          <Input
            id={`${p}-name`}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFieldErrors((prev) => ({ ...prev, name: "" }));
            }}
            placeholder="e.g. Data Structures"
            required
            aria-invalid={!!fieldErrors.name}
          />
          {fieldErrors.name ? <FieldError>{fieldErrors.name}</FieldError> : null}
        </Field>
        <Field data-invalid={!!fieldErrors.code}>
          <FieldLabel htmlFor={`${p}-code`}>Code</FieldLabel>
          <Input
            id={`${p}-code`}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setFieldErrors((prev) => ({ ...prev, code: "" }));
            }}
            placeholder="e.g. CS201"
            required
            className="uppercase"
            aria-invalid={!!fieldErrors.code}
          />
          {fieldErrors.code ? <FieldError>{fieldErrors.code}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor={`${p}-description`}>Description</FieldLabel>
          <Input id={`${p}-description`} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${p}-prerequisites`}>Prerequisites</FieldLabel>
          <CourseMultiSelect
            selectedCourses={prerequisiteIds}
            onChange={(ids) => setPrerequisiteIds(ids)}
            courses={coursesCatalog}
          />
        </Field>
        <Field data-invalid={!!fieldErrors.credits}>
          <FieldLabel htmlFor={`${p}-credits`}>Credits</FieldLabel>
          <Input
            id={`${p}-credits`}
            inputMode="numeric"
            min={0}
            value={creditsStr}
            onChange={(e) => {
              setCreditsStr(filterDigitsOnly(e.target.value));
              setFieldErrors((prev) => ({ ...prev, credits: "" }));
            }}
            onBlur={() => setCreditsStr((s) => normalizeUnsignedIntString(s))}
            required
            aria-invalid={!!fieldErrors.credits}
          />
          {fieldErrors.credits ? <FieldError>{fieldErrors.credits}</FieldError> : null}
        </Field>
        <Field data-invalid={!!fieldErrors.lecture_hours}>
          <FieldLabel htmlFor={`${p}-lectureHours`}>Lecture Hours</FieldLabel>
          <Input
            id={`${p}-lectureHours`}
            inputMode="numeric"
            min={0}
            value={lectureHoursStr}
            onChange={(e) => {
              setLectureHoursStr(filterDigitsOnly(e.target.value));
              setFieldErrors((prev) => ({ ...prev, lecture_hours: "" }));
            }}
            onBlur={() => setLectureHoursStr((s) => normalizeUnsignedIntString(s))}
            required
            aria-invalid={!!fieldErrors.lecture_hours}
          />
          {fieldErrors.lecture_hours ? <FieldError>{fieldErrors.lecture_hours}</FieldError> : null}
        </Field>
        <Field data-invalid={!!fieldErrors.lab_hours}>
          <FieldLabel htmlFor={`${p}-labHours`}>Lab Hours</FieldLabel>
          <Input
            id={`${p}-labHours`}
            inputMode="numeric"
            min={0}
            value={labHoursStr}
            onChange={(e) => {
              setLabHoursStr(filterDigitsOnly(e.target.value));
              setFieldErrors((prev) => ({ ...prev, lab_hours: "" }));
            }}
            onBlur={() => setLabHoursStr((s) => normalizeUnsignedIntString(s))}
            required
            aria-invalid={!!fieldErrors.lab_hours}
          />
          {fieldErrors.lab_hours ? <FieldError>{fieldErrors.lab_hours}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel>Program</FieldLabel>
          <Input
            readOnly
            tabIndex={-1}
            value={`${program.name} (${program.code})`}
            className="pointer-events-none bg-muted/60"
          />
        </Field>
        <Field>
          <FieldLabel>Status</FieldLabel>
          <Select
            value={status}
            onValueChange={(v) => {
              if (v === "ACTIVE" || v === "INACTIVE" || v === "ARCHIVED") setStatus(v);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Curriculum placement (this semester)</h4>
        <FieldGroup>
          <Field>
            <FieldLabel>Course type</FieldLabel>
            <Select
              value={courseKind}
              onValueChange={(v) => {
                if (v === "COMPULSORY" || v === "ELECTIVE") {
                  setCourseKind(v);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPULSORY">Compulsory</SelectItem>
                <SelectItem value="ELECTIVE">Elective</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </div>

      <Button type="submit" disabled={savingCourse}>
        {savingCourse ? "Saving…" : "Save course"}
      </Button>
    </form>
  );
}
