"use client";

import UniversalTable from "@/components/universal-table/UniversalTable";
import { Column, TableAction } from "@/components/universal-table/table.types";
import type { HeaderActionGroup } from "@/components/universal-table/UniversalTable";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";

export interface ParticipantTableRow {
  _id: string;
  firstName: string;
  surName: string;
  fullName: string;
  role: string;
  employmentStatus: string;
}

const columns: Column<ParticipantTableRow>[] = [
  { key: "firstName", title: "First Name" },
  { key: "surName", title: "Sur Name" },
  { key: "fullName", title: "Full Name" },
  { key: "role", title: "Role" },
  {
    key: "employmentStatus",
    title: "Employment Status",
    render: (row) => (
      <span
        className={
          row.employmentStatus === "Active"
            ? "text-green-700"
            : "text-amber-700"
        }
      >
        {row.employmentStatus}
      </span>
    ),
  },
];

interface ParticipantTableProps {
  data: ParticipantTableRow[];
  onAdd: () => void;
  onView: (row: ParticipantTableRow) => void;
  onEdit: (row: ParticipantTableRow) => void;
  onDelete: (row: ParticipantTableRow) => void;
}

export default function ParticipantTable({
  data,
  onAdd,
  onView,
  onEdit,
  onDelete,
}: ParticipantTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Participant",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAdd,
          icon: <Plus className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<ParticipantTableRow>[] = [
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
    <UniversalTable<ParticipantTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
