/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useMemo, useState } from "react";
import { TableProps } from "./table.types";
import { paginateData, searchData, sortData } from "./table.utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "__all__";

export function UniversalTable<T extends Record<string, any>>({
  data,
  columns,
  actions,
  pageSize = 5,
  searchable = true,
  filterable = true,
}: TableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<Partial<Record<keyof T, string>>>({});

  // minimal sort state
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filteredData = useMemo(() => {
    let tempData = searchData(
      data,
      searchQuery,
      columns.map((c) => c.key),
    );

    // apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        tempData = tempData.filter((row) => String(row[key as keyof T] ?? "") === value);
      }
    });

    // apply sorting (only if enabled for that column)
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col?.sortable) {
        tempData = sortData(tempData, sortKey, sortDir);
      }
    }

    return tempData;
  }, [data, searchQuery, filters, columns, sortKey, sortDir]);

  const { items: paginatedData, totalPages, safePage } = useMemo(
    () => paginateData(filteredData, page, pageSize),
    [filteredData, page, pageSize],
  );

  // keep page valid when filters/search shrink results
  if (safePage !== page) setPage(safePage);

  const toggleSort = (key: keyof T) => {
    const col = columns.find((c) => c.key === key);
    if (!col?.sortable) return;

    setPage(1);
    setSortKey((prev) => {
      if (prev !== key) {
        setSortDir("asc");
        return key;
      }
      // same key -> toggle direction
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return key;
    });
  };

  return (
    <div className="space-y-4">
      {searchable && (
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
        />
      )}

      <div className="overflow-x-auto border rounded-lg">
        {/* min-w-max makes horizontal scroll actually useful on mobile */}
        <Table className="min-w-max">
          <TableHeader>
            <TableRow>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const sortIndicator =
                  col.sortable && isSorted ? (sortDir === "asc" ? " ▲" : " ▼") : "";

                return (
                  <TableHead key={String(col.key)} className="align-top">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        className={col.sortable ? "text-left hover:opacity-80" : "text-left"}
                        onClick={() => toggleSort(col.key)}
                        disabled={!col.sortable}
                      >
                        <span>
                          {col.title}
                          {sortIndicator}
                        </span>
                      </button>

                      {filterable && col.filterable && (
                        <Select
                          value={filters[col.key] ?? ALL}
                          onValueChange={(val) => {
                            setFilters((prev) => {
                              const next = { ...prev };
                              if (val === ALL) delete next[col.key];
                              else next[col.key] = val;
                              return next;
                            });
                            setPage(1); // IMPORTANT: reset page on filter change
                          }}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="Filter" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ALL}>All</SelectItem>
                            {Array.from(
                              new Set(data.map((row) => String(row[col.key] ?? ""))),
                            )
                              .filter((v) => v !== "")
                              .map((val) => (
                                <SelectItem key={val} value={val}>
                                  {val}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableHead>
                );
              })}

              {actions?.length ? <TableHead>Actions</TableHead> : null}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions?.length ? 1 : 0)}
                  className="text-center py-6"
                >
                  No data found
                </TableCell>
              </TableRow>
            )}

            {paginatedData.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={String(col.key)}>
                    {col.render ? col.render(row) : String(row[col.key] ?? "")}
                  </TableCell>
                ))}

                {actions?.length ? (
                  <TableCell className="space-x-2">
                    {actions.map((a) => (
                      <Button
                        key={a.label}
                        size="sm"
                        variant={a.variant || "default"}
                        onClick={() => a.onClick(row)}
                      >
                        {a.label}
                      </Button>
                    ))}
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </Button>

        <span className="text-sm">
          Page {page} of {totalPages}
        </span>

        <Button
          size="sm"
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
