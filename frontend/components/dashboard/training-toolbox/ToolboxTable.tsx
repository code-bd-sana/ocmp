"use client";

import { Column, TableAction } from "@/components/universal-table/table.types";
import UniversalTable, {
  HeaderActionGroup,
} from "@/components/universal-table/UniversalTable";
import { TrainingToolboxRow } from "@/lib/training-toolbox/training-toolbox.type";
import { Eye, MessageSquare, Pencil, Trash2 } from "lucide-react";

export interface ToolboxTableRow {
  _id: string;
  date: string;
  driverName: string;
  toolboxTitle: string;
  typeOfToolbox: string;
  deliveredBy: string;
  notes?: string;
  signed?: boolean;
  followUpNeeded?: boolean;
  followUpDate?: string;
  signOff?: boolean;
}

/** Map API response */
export function toToolboxTableRow(toolbox: TrainingToolboxRow[]) {
  return toolbox.map((item) => ({
    _id: item._id,
    date: item.date,
    driverId: item.driverId,
    driverName: item.driverName,
    toolboxTitle: item.toolboxTitle,
    typeOfToolbox: item.typeOfToolbox,
    deliveredBy: item.deliveredBy,
    notes: item.notes,
    signed: item.signed,
    followUpNeeded: item.followUpNeeded,
    followUpDate: item.followUpDate,
    signOff: item.signOff,
  }));
}

const columns: Column<ToolboxTableRow>[] = [
  { key: "date", title: "Date" },
  { key: "driverName", title: "Driver" },
  { key: "toolboxTitle", title: "Toolbox Title" },
  { key: "typeOfToolbox", title: "Type of Toolbox" },
  { key: "deliveredBy", title: "Delivered By" },
];

interface ToolboxTableProps {
  data: ToolboxTableRow[];
  onAddToolbox: () => void;
  onView: (row: ToolboxTableRow) => void;
  onEdit: (row: ToolboxTableRow) => void;
  onDelete: (row: ToolboxTableRow) => void;
}

export default function ToolboxTable({
  data,
  onAddToolbox,
  onView,
  onEdit,
  onDelete,
}: ToolboxTableProps) {
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
          csvFileName: "toolbox-sessions",
          visibility: true,
          positionIndex: 0,
        },
        {
          label: "Add Toolbox Session",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddToolbox,
          icon: <MessageSquare className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<ToolboxTableRow>[] = [
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

  // Table implementation would go here, using `columns` and `data`
  return (
    <UniversalTable<ToolboxTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
