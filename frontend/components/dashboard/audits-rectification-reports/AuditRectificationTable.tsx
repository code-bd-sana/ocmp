"use client";

import UniversalTable, {
  HeaderActionGroup,
} from "@/components/universal-table/UniversalTable";
import { Column, TableAction } from "@/components/universal-table/table.types";
import { FileCheck2, Eye, Pencil, Trash2 } from "lucide-react";
import { AuditRectificationReportRow } from "@/lib/audits-rectification-reports/audits-rectification-reports.types";

export interface AuditRectificationTableRow {
  _id: string;
  auditDate: string;
  title: string;
  type: string;
  status: string;
  responsiblePerson: string;
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

export function toAuditRectificationTableRows(
  rows: AuditRectificationReportRow[],
): AuditRectificationTableRow[] {
  return rows.map((row) => ({
    _id: row._id,
    auditDate: formatDate(row.auditDate),
    title: row.title,
    type: row.type,
    status: row.status || "Pending",
    responsiblePerson: row.responsiblePerson || "-",
  }));
}

const columns: Column<AuditRectificationTableRow>[] = [
  { key: "auditDate", title: "Audit Date" },
  { key: "title", title: "Title" },
  { key: "type", title: "Type" },
  { key: "status", title: "Status" },
  { key: "responsiblePerson", title: "Responsible Person" },
];

interface AuditRectificationTableProps {
  data: AuditRectificationTableRow[];
  onAddReport: () => void;
  onView: (row: AuditRectificationTableRow) => void;
  onEdit: (row: AuditRectificationTableRow) => void;
  onDelete: (row: AuditRectificationTableRow) => void;
}

export default function AuditRectificationTable({
  data,
  onAddReport,
  onView,
  onEdit,
  onDelete,
}: AuditRectificationTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Audit Report",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddReport,
          icon: <FileCheck2 className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<AuditRectificationTableRow>[] = [
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
    <UniversalTable<AuditRectificationTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
