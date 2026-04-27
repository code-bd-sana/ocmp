"use client";

import { Column, TableAction } from "@/components/universal-table/table.types";
import UniversalTable, {
  HeaderActionGroup,
} from "@/components/universal-table/UniversalTable";
import { Eye, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { MaintenanceProviderCommunicationRow } from "@/lib/maintenance-meeting/maintenance-meeting.types";

const columns: Column<MaintenanceProviderCommunicationRow>[] = [
  { key: "providerName", title: "Provider Name" },
  {
    key: "dateOfCommunication",
    title: "Date of Communication",
    render: (row) =>
      row.dateOfCommunication
        ? new Date(row.dateOfCommunication).toLocaleDateString()
        : "—",
  },
  { key: "type", title: "Type" },
  { key: "details", title: "Details" },
];

interface MaintenanceProviderTableProps {
  data: MaintenanceProviderCommunicationRow[];
  onAddClick: () => void;
  onView: (row: MaintenanceProviderCommunicationRow) => void;
  onEdit: (row: MaintenanceProviderCommunicationRow) => void;
  onDelete: (row: MaintenanceProviderCommunicationRow) => void;
}

export default function MaintenanceProviderTable({
  data,
  onAddClick,
  onView,
  onEdit,
  onDelete,
}: MaintenanceProviderTableProps) {
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
          csvFileName: "maintenance-provider-communications",
          visibility: true,
          positionIndex: 0,
        },
        {
          label: "Add Maintenance Provider Communication",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddClick,
          icon: <MessageSquare className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<MaintenanceProviderCommunicationRow>[] = [
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
    <UniversalTable<MaintenanceProviderCommunicationRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
