"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Semester } from "@/types";
import type { Subject } from "@/types";

interface SubjectFormProps {
  semesters: Semester[];
  initial?: Partial<Subject>;
  onSubmit: (data: {
    code: string;
    name: string;
    credits: number;
    lectureHours: number;
    labHours: number;
    semesterId: string;
  }) => Promise<void>;
  onCancel?: () => void;
}

export function SubjectForm({
  semesters,
  initial,
  onSubmit,
  onCancel,
}: SubjectFormProps) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [credits, setCredits] = useState(String(initial?.credits ?? "3"));
  const [lectureHours, setLectureHours] = useState(
    String(initial?.lectureHours ?? "3")
  );
  const [labHours, setLabHours] = useState(String(initial?.labHours ?? "0"));
  const [semesterId, setSemesterId] = useState(initial?.semesterId ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (semesters.length && !semesterId) {
      setSemesterId(semesters[0].id);
    }
  }, [semesters, semesterId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const c = parseInt(credits, 10);
    const lh = parseInt(lectureHours, 10);
    const lh2 = parseInt(labHours, 10);
    if (!code.trim()) {
      setError("Code is required");
      return;
    }
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (isNaN(c) || c < 0 || c > 30) {
      setError("Credits must be 0–30");
      return;
    }
    if (isNaN(lh) || lh < 0 || isNaN(lh2) || lh2 < 0) {
      setError("Hours must be ≥ 0");
      return;
    }
    if (!semesterId) {
      setError("Semester is required");
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        code: code.trim(),
        name: name.trim(),
        credits: c,
        lectureHours: lh,
        labHours: lh2,
        semesterId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. CS101"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="semester">Semester</Label>
          <Select value={semesterId} onValueChange={setSemesterId} required>
            <SelectTrigger id="semester">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Subject name"
          required
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="credits">Credits</Label>
          <Input
            id="credits"
            type="number"
            min={0}
            max={30}
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lectureHours">Lecture hours</Label>
          <Input
            id="lectureHours"
            type="number"
            min={0}
            value={lectureHours}
            onChange={(e) => setLectureHours(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="labHours">Lab hours</Label>
          <Input
            id="labHours"
            type="number"
            min={0}
            value={labHours}
            onChange={(e) => setLabHours(e.target.value)}
            required
          />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
