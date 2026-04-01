"use client";

import UniversalTable from "@/components/universal-table/UniversalTable";
import { Column, TableAction } from "@/components/universal-table/table.types";
import type { HeaderActionGroup } from "@/components/universal-table/UniversalTable";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";

export interface TrainingRegisterTableRow {
  _id: string;
  firstName: string;
  surName: string;
  fullName: string;
  training: string;
  completed: string;
}

const columns: Column<TrainingRegisterTableRow>[] = [
  { key: "firstName", title: "First Name" },
  { key: "surName", title: "Sur Name" },
  { key: "fullName", title: "Full Name" },
  { key: "training", title: "Training" },
  { key: "completed", title: "Completed" },
];

interface TrainingRegisterTableProps {
  data: TrainingRegisterTableRow[];
  onAdd: () => void;
  onView: (row: TrainingRegisterTableRow) => void;
  onEdit: (row: TrainingRegisterTableRow) => void;
  onDelete: (row: TrainingRegisterTableRow) => void;
}

export default function TrainingRegisterTable({
  data,
  onAdd,
  onView,
  onEdit,
  onDelete,
}: TrainingRegisterTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Register",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAdd,
          icon: <Plus className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<TrainingRegisterTableRow>[] = [
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
    <UniversalTable<TrainingRegisterTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
