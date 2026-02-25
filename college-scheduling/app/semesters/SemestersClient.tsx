"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/tables/DataTable";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import type { Semester } from "@/types";

export function SemestersClient({
  initialData,
  programNames,
  programOptions,
}: {
  initialData: Semester[];
  programNames: Record<string, string>;
  programOptions: { value: string; label: string }[];
}) {
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState<string>("all");

  const filteredData = useMemo(() => {
    let list = initialData;
    if (programFilter && programFilter !== "all") {
      list = list.filter((s) => s.programId === programFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (programNames[s.programId] ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [initialData, search, programFilter, programNames]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Semesters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SearchFilterBar
          searchPlaceholder="Search by name or program..."
          searchValue={search}
          onSearchChange={setSearch}
          filterLabel="Program"
          filterValue={programFilter}
          filterOptions={programOptions}
          onFilterChange={setProgramFilter}
          filterPlaceholder="All programs"
        />
        <DataTable<Semester>
          data={filteredData}
          keyExtractor={(s) => s.id}
          columns={[
            { key: "name", header: "Name" },
            { key: "order", header: "Order" },
            {
              key: "programId",
              header: "Program",
              render: (s) => programNames[s.programId] ?? s.programId,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
