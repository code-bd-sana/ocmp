"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { TableProps } from "./table.types";

// Dynamic button type
export type HeaderButton = {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "secondary";
  className?: string;
};

// Dynamic search type
export type TableSearch = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

interface UniversalTablePropsWithFilters<T> extends TableProps<T> {
  filterOptions?: string[];
  headerButtons?: HeaderButton[]; // top header buttons
  inlineButtons?: HeaderButton[]; // inside table container buttons
  headerSearch?: TableSearch;
  inlineSearch?: TableSearch;
}

export default function UniversalTable<T>({
  data,
  columns,
  actions,
  rowKey,
  title = "Data Table",
  filterable = false,
  emptyText = "No records found",
  actionsPosition = "end",
  filterOptions = [],
  headerButtons = [],
  inlineButtons = [],
  headerSearch,
  inlineSearch,
}: UniversalTablePropsWithFilters<T>) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Search values (controlled or internal)
  const [internalHeaderSearch, setInternalHeaderSearch] = useState("");
  const [internalInlineSearch, setInternalInlineSearch] = useState("");

  const headerSearchValue = headerSearch?.value ?? internalHeaderSearch;
  const inlineSearchValue = inlineSearch?.value ?? internalInlineSearch;

  // Filtered data based on search + filter
  const filteredData = data.filter((row) => {
    let matchesHeaderSearch = true;
    let matchesInlineSearch = true;

    if (headerSearch || internalHeaderSearch !== undefined) {
      matchesHeaderSearch = columns.some((col) =>
        String(row[col.key])
          .toLowerCase()
          .includes(headerSearchValue.toLowerCase()),
      );
    }

    if (inlineSearch || internalInlineSearch !== undefined) {
      matchesInlineSearch = columns.some((col) =>
        String(row[col.key])
          .toLowerCase()
          .includes(inlineSearchValue.toLowerCase()),
      );
    }

    let matchesFilter = true;
    if (filterable && activeFilter) {
      matchesFilter = Object.values(row as Record<string, unknown>).some(
        (val) => String(val) === activeFilter,
      );
    }

    return matchesHeaderSearch && matchesInlineSearch && matchesFilter;
  });

  return (
    <div className='w-full bg-[#F9F9FA] rounded-lg shadow-sm overflow-x-auto'>
      {/* Main Header */}
      <div className='mx-auto p-5'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4'>
          <h1 className='text-3xl font-semibold text-blue-800'>{title}</h1>

          <div className='flex items-center gap-2'>
            {headerSearch && (
              <Input
                placeholder={headerSearch.placeholder || "Search..."}
                value={headerSearchValue}
                onChange={(e) =>
                  headerSearch.onChange
                    ? headerSearch.onChange(e.target.value)
                    : setInternalHeaderSearch(e.target.value)
                }
                className={headerSearch.className}
              />
            )}

            {headerButtons.map((btn, idx) => (
              <Button
                key={idx}
                variant={btn.variant || "default"}
                className={btn.className}
                onClick={btn.onClick}>
                {btn.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Inline / Table Container Buttons + Search + Filter */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4'>
          <h2 className='text-xl font-semibold'>Overview</h2>

          <div className='flex items-center gap-2'>
            {inlineSearch && (
              <Input
                placeholder={inlineSearch.placeholder || "Search..."}
                value={inlineSearchValue}
                onChange={(e) =>
                  inlineSearch.onChange
                    ? inlineSearch.onChange(e.target.value)
                    : setInternalInlineSearch(e.target.value)
                }
                className={inlineSearch.className}
              />
            )}

            {filterable && filterOptions.length > 0 && (
              <Select
                value={activeFilter || ""}
                onValueChange={(val) => setActiveFilter(val || null)}>
                <SelectTrigger className='w-40'>
                  <SelectValue placeholder='Filter' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {filterOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}

            {inlineButtons.map((btn, idx) => (
              <Button
                key={idx}
                variant={btn.variant || "default"}
                className={btn.className}
                onClick={btn.onClick}>
                {btn.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='p-5'>
        <Table className='min-w-[600px]'>
          <TableHeader>
            <TableRow>
              {actions && actionsPosition === "start" && (
                <TableHead>Actions</TableHead>
              )}
              {columns.map((col) => (
                <TableHead key={String(col.key)}>{col.title}</TableHead>
              ))}
              {actions && actionsPosition === "end" && (
                <TableHead>Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <TableRow key={rowKey(row)}>
                  {actions && actionsPosition === "start" && (
                    <TableCell className='flex gap-2'>
                      {actions.map((action, idx) => (
                        <Button
                          key={idx}
                          variant={action.variant || "default"}
                          size='sm'
                          onClick={() => action.onClick(row)}>
                          {action.icon}
                          {action.label}
                        </Button>
                      ))}
                    </TableCell>
                  )}

                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      {col.render ? col.render(row) : String(row[col.key])}
                    </TableCell>
                  ))}

                  {actions && actionsPosition === "end" && (
                    <TableCell className='flex gap-2'>
                      {actions.map((action, idx) => (
                        <Button
                          key={idx}
                          variant={action.variant || "default"}
                          size='sm'
                          onClick={() => action.onClick(row)}>
                          {action.icon}
                          {action.label}
                        </Button>
                      ))}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className='text-center py-4'>
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
