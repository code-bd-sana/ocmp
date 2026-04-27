"use client";

import UniversalTable, { HeaderButton } from "@/components/universal-table/UniversalTable";
import { Column, TableAction } from "@/components/universal-table/table.types";
import { Pencil } from "lucide-react";

export interface TrainingRecordTableRow {
  registerId: string;
  firstName: string;
  surName: string;
  fullName: string;
  training: string;
  intervalDay: string;
  trainingDate: string;
  status: string;
}

export type HeaderActionGroup = {
  title: string;
  startingActionGroup: HeaderButton[];
  endActionGroup: HeaderButton[];
};

const columns: Column<TrainingRecordTableRow>[] = [
  { key: "firstName", title: "First Name" },
  { key: "surName", title: "Sur Name" },
  { key: "fullName", title: "Full Name" },
  { key: "training", title: "Training" },
  { key: "intervalDay", title: "Interval Day" },
  { key: "trainingDate", title: "Training Date" },
  { key: "status", title: "Status" },
];

interface TrainingRecordTableProps {
  data: TrainingRecordTableRow[];
  onUpdateStatus: (row: TrainingRecordTableRow) => void;
}

export default function TrainingRecordTable({
  data,
  onUpdateStatus,
}: TrainingRecordTableProps) {
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
          csvFileName: "training-records",
          visibility: true,
          positionIndex: 0,
        }
      ],
    },
  ];
  const actions: TableAction<TrainingRecordTableRow>[] = [
    {
      label: "",
      variant: "edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: onUpdateStatus,
    },
  ];

  return (
    <UniversalTable<TrainingRecordTableRow>
      data={data}
      columns={columns}
      actions={actions}
      headerActionGroups={headerActionGroups}
      rowKey={(row) => row.registerId}
    />
  );
}
