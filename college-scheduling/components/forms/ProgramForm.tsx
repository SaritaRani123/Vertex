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
import type { Department } from "@/types";
import type { Program } from "@/types";

interface ProgramFormProps {
  departments: Department[];
  initial?: Partial<Program>;
  onSubmit: (data: {
    name: string;
    duration: number;
    degreeType: string;
    totalCredits: number;
    departmentId: string;
  }) => Promise<void>;
  onCancel?: () => void;
}

export function ProgramForm({
  departments,
  initial,
  onSubmit,
  onCancel,
}: ProgramFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [duration, setDuration] = useState(String(initial?.duration ?? "4"));
  const [degreeType, setDegreeType] = useState(initial?.degreeType ?? "Bachelor");
  const [totalCredits, setTotalCredits] = useState(
    String(initial?.totalCredits ?? "120")
  );
  const [departmentId, setDepartmentId] = useState(initial?.departmentId ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (departments.length && !departmentId) {
      setDepartmentId(departments[0].id);
    }
  }, [departments, departmentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const d = parseInt(duration, 10);
    const c = parseInt(totalCredits, 10);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (isNaN(d) || d < 1 || d > 20) {
      setError("Duration must be 1–20");
      return;
    }
    if (isNaN(c) || c < 0) {
      setError("Total credits must be ≥ 0");
      return;
    }
    if (!departmentId) {
      setError("Department is required");
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        duration: d,
        degreeType: degreeType.trim(),
        totalCredits: c,
        departmentId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Program name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Select
          value={departmentId}
          onValueChange={setDepartmentId}
          required
        >
          <SelectTrigger id="department">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (years)</Label>
          <Input
            id="duration"
            type="number"
            min={1}
            max={20}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="credits">Total credits</Label>
          <Input
            id="credits"
            type="number"
            min={0}
            value={totalCredits}
            onChange={(e) => setTotalCredits(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="degreeType">Degree type</Label>
        <Input
          id="degreeType"
          value={degreeType}
          onChange={(e) => setDegreeType(e.target.value)}
          placeholder="e.g. Bachelor, Master"
          required
        />
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
