"use client";

import UniversalTable from "@/components/universal-table/UniversalTable";
import { Column, TableAction } from "@/components/universal-table/table.types";
import {
  TransportManagerTrainingRow,
  TransportManagerTrainingRenewalTracker,
} from "@/lib/transport-manager-training/transport-manager-training.types";
import { Eye, GraduationCap, Pencil, Trash2 } from "lucide-react";
import type { HeaderActionGroup } from "@/components/universal-table/UniversalTable";

export interface TransportManagerTrainingTableRow {
  _id: string;
  name: string;
  trainingCourse: string;
  unitTitle: string;
  completionDate: string;
  renewalTracker: TransportManagerTrainingRenewalTracker;
  nextDueDate: string;
}

function formatDate(value?: string): string {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function toTransportManagerTrainingTableRows(
  trainings: TransportManagerTrainingRow[],
): TransportManagerTrainingTableRow[] {
  return trainings.map((training) => ({
    _id: training._id,
    name: training.name || "—",
    trainingCourse: training.trainingCourse,
    unitTitle: training.unitTitle,
    completionDate: formatDate(training.completionDate),
    renewalTracker: training.renewalTracker,
    nextDueDate: formatDate(training.nextDueDate),
  }));
}

const columns: Column<TransportManagerTrainingTableRow>[] = [
  { key: "name", title: "Name" },
  { key: "trainingCourse", title: "Training Course" },
  { key: "unitTitle", title: "Unit Title" },
  { key: "completionDate", title: "Completion Date" },
  { key: "renewalTracker", title: "Renewal Tracker" },
  { key: "nextDueDate", title: "Next Due Date" },
];

interface TransportManagerTrainingTableProps {
  data: TransportManagerTrainingTableRow[];
  onAddTraining: () => void;
  onView: (row: TransportManagerTrainingTableRow) => void;
  onEdit: (row: TransportManagerTrainingTableRow) => void;
  onDelete: (row: TransportManagerTrainingTableRow) => void;
}

export default function TransportManagerTrainingTable({
  data,
  onAddTraining,
  onView,
  onEdit,
  onDelete,
}: TransportManagerTrainingTableProps) {
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
          csvFileName: "transport-manager-training",
          visibility: true,
          positionIndex: 0,
        },
        {
          label: "Add Training",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddTraining,
          icon: <GraduationCap className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<TransportManagerTrainingTableRow>[] = [
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
    <UniversalTable<TransportManagerTrainingTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
