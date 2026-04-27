"use client";

import UniversalTable, {
  HeaderActionGroup,
} from "@/components/universal-table/UniversalTable";
import { Column, TableAction } from "@/components/universal-table/table.types";
import { ContactLogRow } from "@/lib/contact-log/contact-log.types";
import { BookUser, Eye, Pencil, Trash2 } from "lucide-react";

export interface ContactLogTableRow {
  _id: string;
  date: string;
  contactMethod: string;
  person: string;
  subject: string;
  followUpRequired: string;
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

export function toContactLogTableRows(
  rows: ContactLogRow[],
): ContactLogTableRow[] {
  return rows.map((row) => ({
    _id: row._id,
    date: formatDate(row.date),
    contactMethod: row.contactMethod || "-",
    person: row.person,
    subject: row.subject,
    followUpRequired: row.followUpRequired ? "Yes" : "No",
  }));
}

const columns: Column<ContactLogTableRow>[] = [
  { key: "date", title: "Date" },
  { key: "contactMethod", title: "Method" },
  { key: "person", title: "Person" },
  { key: "subject", title: "Subject" },
  { key: "followUpRequired", title: "Follow-Up" },
];

interface ContactLogsTableProps {
  data: ContactLogTableRow[];
  onAddContactLog: () => void;
  onView: (row: ContactLogTableRow) => void;
  onEdit: (row: ContactLogTableRow) => void;
  onDelete: (row: ContactLogTableRow) => void;
}

export default function ContactLogsTable({
  data,
  onAddContactLog,
  onView,
  onEdit,
  onDelete,
}: ContactLogsTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Export",
          className: "btn btn-sm rounded-xs bg-green-600 text-white hover:bg-green-700",
          onClick: () => {},
          exportCsv: true,
          csvFileName: "contact-logs-list",
          visibility: true,
          positionIndex: 0,
        },
        {
          label: "Add Contact Log",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddContactLog,
          icon: <BookUser className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<ContactLogTableRow>[] = [
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
    <UniversalTable<ContactLogTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
