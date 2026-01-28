import React from "react";

/** Column definition for the table */
export type Column<T> = {
  /** Unique key for the column, must exist in T */
  key: keyof T;
  /** Column header title */
  title: string;
  /** Optional custom render function for this column */
  render?: (row: T) => React.ReactNode;
};

/** Action buttons per row */
export type TableAction<T> = {
  /** Label for the action */
  label: string;
  /** Function to call when clicked, receives row data */
  onClick: (row: T) => void;
  /** Optional variant for styling */
  variant?:
    | "default"
    | "destructive"
    | "secondary"
    | "edit"
    | "delete"
    | "view"
    | "download";
  /** Optional icon */
  icon?: React.ReactNode;
};

/** Props for the universal table component */
export interface TableProps<T> {
  /** Table data */
  data: readonly T[];
  /** Columns definition */
  columns: readonly Column<T>[];
  /** Optional row actions */
  actions?: readonly TableAction<T>[];
  /** Function to uniquely identify a row */
  rowKey: (row: T) => string;
  /** Optional page size for pagination */
  pageSize?: number;
  /** Enable global search */
  searchable?: boolean;
  /** Enable column filters */
  filterable?: boolean;
  /** Table title */
  title?: string;
  /** Placeholder text for search input */
  searchPlaceholder?: string;
  /** Text to show when table is empty */
  emptyText?: string;
  /** Position for action buttons */
  buttonPosition?: "inside" | "outside";
  /** Position for actions column */
  actionsPosition?: "start" | "end";
}
