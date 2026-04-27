"use client";

import UniversalTable from "@/components/universal-table/UniversalTable";
import { Column, TableAction } from "@/components/universal-table/table.types";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import type { HeaderActionGroup } from "@/components/universal-table/UniversalTable";

export interface HelperSheetTableRow {
  _id: string;
  training: string;
  intervalText: string;
  intervalDays: string;
}

const columns: Column<HelperSheetTableRow>[] = [
  { key: "training", title: "Training" },
  {
    key: "intervalText",
    title: "IntervalText",
    render: (row) => (
      <div className="bg-[#fef6e8] px-2 py-1">{row.intervalText}</div>
    ),
  },
  { key: "intervalDays", title: "IntervalDays" },
];

interface HelperSheetTableProps {
  data: HelperSheetTableRow[];
  onAddTraining: () => void;
  onView: (row: HelperSheetTableRow) => void;
  onEdit: (row: HelperSheetTableRow) => void;
  onDelete: (row: HelperSheetTableRow) => void;
}

export default function HelperSheetTable({
  data,
  onAddTraining,
  onView,
  onEdit,
  onDelete,
}: HelperSheetTableProps) {
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
          csvFileName: "helper-sheet-list",
          visibility: true,
          positionIndex: 0,
        },
        {
          label: "Add New Training",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddTraining,
          icon: <Plus className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<HelperSheetTableRow>[] = [
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
    <UniversalTable<HelperSheetTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
