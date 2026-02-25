"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface SearchFilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterLabel?: string;
  filterValue?: string;
  filterOptions?: { value: string; label: string }[];
  onFilterChange?: (value: string) => void;
  filterPlaceholder?: string;
}

export function SearchFilterBar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filterLabel,
  filterValue,
  filterOptions = [],
  onFilterChange,
  filterPlaceholder = "All",
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      {filterLabel && onFilterChange && (
        <div className="flex shrink-0 flex-col gap-2 sm:w-48">
          <Label className="text-muted-foreground">{filterLabel}</Label>
          <Select value={filterValue ?? "all"} onValueChange={onFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder={filterPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{filterPlaceholder}</SelectItem>
              {filterOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
