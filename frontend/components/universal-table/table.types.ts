export type Column<T> = {
  key: keyof T;
  title: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
};

export type TableAction<T> = {
  label: string;
  onClick: (row: T) => void;
  variant?: "default" | "destructive" | "secondary";
  icon?: React.ReactNode;
};

export interface TableProps<T> {
  data: readonly T[];
  columns: readonly Column<T>[];
  actions?: readonly TableAction<T>[];
  rowKey: (row: T) => string;
  pageSize?: number;
  searchable?: boolean;
  filterable?: boolean;
  title?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  buttonPosition?: "inside" | "outside";
  actionsPosition?: "start" | "end";
}
