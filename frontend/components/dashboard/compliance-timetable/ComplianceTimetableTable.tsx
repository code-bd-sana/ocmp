"use client";

import UniversalTable, {
  HeaderActionGroup,
} from "@/components/universal-table/UniversalTable";
import { Column, TableAction } from "@/components/universal-table/table.types";
import { ClipboardList, Eye, Pencil, Trash2 } from "lucide-react";
import { ComplianceTimetableRow } from "@/lib/compliance-timetable/compliance-timetable.types";

export interface ComplianceTimetableTableRow {
  _id: string;
  task: string;
  responsibleParty: string;
  dueDate: string;
  status: string;
}

function formatDate(value?: string): string {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function formatStatus(value?: string): string {
  if (!value) return "PENDING";
  return value.replace(/_/g, " ");
}

export function toComplianceTimetableTableRows(
  rows: ComplianceTimetableRow[],
): ComplianceTimetableTableRow[] {
  return rows.map((row) => ({
    _id: row._id,
    task: row.task,
    responsibleParty: row.responsibleParty || "-",
    dueDate: formatDate(row.dueDate),
    status: formatStatus(row.status),
  }));
}

const columns: Column<ComplianceTimetableTableRow>[] = [
  { key: "task", title: "Task" },
  { key: "responsibleParty", title: "Responsible Party" },
  { key: "dueDate", title: "Due Date" },
  { key: "status", title: "Status" },
];

interface ComplianceTimetableTableProps {
  data: ComplianceTimetableTableRow[];
  onAddComplianceTimetable: () => void;
  onView: (row: ComplianceTimetableTableRow) => void;
  onEdit: (row: ComplianceTimetableTableRow) => void;
  onDelete: (row: ComplianceTimetableTableRow) => void;
}

export default function ComplianceTimetableTable({
  data,
  onAddComplianceTimetable,
  onView,
  onEdit,
  onDelete,
}: ComplianceTimetableTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Compliance Task",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddComplianceTimetable,
          icon: <ClipboardList className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<ComplianceTimetableTableRow>[] = [
    {
      label: "",
      variant: "view",
      icon: <Eye className="h-4 w-4" />,
      onClick: onView,
    },
    {
      label: "",
      variant: "edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: onEdit,
    },
    {
      label: "",
      variant: "delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDelete,
    },
  ];

  return (
    <UniversalTable<ComplianceTimetableTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
