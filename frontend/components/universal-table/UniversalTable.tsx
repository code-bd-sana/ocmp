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

/**
 * Type for dynamic buttons in the table header or inline container
 */
export type HeaderButton = {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "secondary" | "edit" | "delete" | "view" | "download";
  className?: string;
};

/**
 * Type for dynamic search input
 */
export type TableSearch = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

/**
 * Extends TableProps to include dynamic buttons, search, and filters
 */
interface UniversalTablePropsWithFilters<T> extends TableProps<T> {
  filterOptionsHeader?: string[];
  filterOptionsInline?: string[];
  headerButtons?: HeaderButton[];
  inlineButtons?: HeaderButton[];
  headerSearch?: TableSearch;
  inlineSearch?: TableSearch;
}

/**
 * UniversalTable component
 *
 * Supports:
 * - Dynamic columns
 * - Row actions
 * - Header and inline search
 * - Header and inline filters
 * - Header and inline buttons
 *
 * @template T - The type of data used in table rows
 */
export default function UniversalTable<T>({
  data,
  columns,
  actions,
  rowKey,
  title = "Data Table",
  emptyText = "No records found",
  actionsPosition = "end",
  filterOptionsHeader = [],
  filterOptionsInline = [],
  headerButtons = [],
  inlineButtons = [],
  headerSearch,
  inlineSearch,
}: UniversalTablePropsWithFilters<T>) {
  /** Active filter selected from header filter */
  const [activeHeaderFilter, setActiveHeaderFilter] = useState<string | null>(
    null,
  );
  /** Active filter selected from inline filter */
  const [activeInlineFilter, setActiveInlineFilter] = useState<string | null>(
    null,
  );

  /** Internal state for header search */
  const [internalHeaderSearch, setInternalHeaderSearch] = useState("");
  /** Internal state for inline search */
  const [internalInlineSearch, setInternalInlineSearch] = useState("");

  /** Resolve controlled or internal search values */
  const headerSearchValue = headerSearch?.value ?? internalHeaderSearch;
  const inlineSearchValue = inlineSearch?.value ?? internalInlineSearch;

  /**
   * Filter data based on search and filters
   */
  const filteredData = data.filter((row) => {
    let matchesHeaderSearch = true;
    let matchesInlineSearch = true;
    let matchesHeaderFilter = true;
    let matchesInlineFilter = true;

    // Header search
    if (headerSearch || internalHeaderSearch !== undefined) {
      matchesHeaderSearch = columns.some((col) =>
        String(row[col.key])
          .toLowerCase()
          .includes(headerSearchValue.toLowerCase()),
      );
    }

    // Inline search
    if (inlineSearch || internalInlineSearch !== undefined) {
      matchesInlineSearch = columns.some((col) =>
        String(row[col.key])
          .toLowerCase()
          .includes(inlineSearchValue.toLowerCase()),
      );
    }

    // Header filter
    if (activeHeaderFilter) {
      matchesHeaderFilter = Object.values(row as Record<string, unknown>).some(
        (val) => String(val) === activeHeaderFilter,
      );
    }

    // Inline filter
    if (activeInlineFilter) {
      matchesInlineFilter = Object.values(row as Record<string, unknown>).some(
        (val) => String(val) === activeInlineFilter,
      );
    }

    return (
      matchesHeaderSearch &&
      matchesInlineSearch &&
      matchesHeaderFilter &&
      matchesInlineFilter
    );
  });

  return (
    <div className='w-full bg-[#F9F9FA] rounded-lg shadow-sm overflow-x-auto'>
      {/* Header */}
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

            {filterOptionsHeader.length > 0 && (
              <Select
                value={activeHeaderFilter || ""}
                onValueChange={(val) => setActiveHeaderFilter(val || null)}>
                <SelectTrigger className='w-40 bg-white'>
                  <SelectValue placeholder='Header Filter' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {filterOptionsHeader.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
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

        {/* Inline buttons + search + filter */}
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

            {filterOptionsInline.length > 0 && (
              <Select
                value={activeInlineFilter || ""}
                onValueChange={(val) => setActiveInlineFilter(val || null)}>
                <SelectTrigger className='w-40 bg-white'>
                  <SelectValue placeholder='Inline Filter' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {filterOptionsInline.map((option) => (
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
