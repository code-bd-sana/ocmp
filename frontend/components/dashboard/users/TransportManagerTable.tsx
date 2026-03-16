"use client";

import UniversalTable from "@/components/universal-table/UniversalTable";
import { Column, TableAction } from "@/components/universal-table/table.types";
import { TransportManagerType } from "@/lib/clients/client.types";
import { UserPlus, LogIn, LogOut } from "lucide-react";
import type { HeaderActionGroup } from "@/components/universal-table/UniversalTable";

/** Flat row type used by the table */
export interface TransportManagerTableRow {
  _id: string;
  fullName: string;
}

/** Map API response → flat rows */
export function toTableRows(rows: TransportManagerType[]): TransportManagerTableRow[] {
  return rows.map((r) => ({
    _id: r._id,
    fullName: r.fullName,
  }));
}

const columns: Column<TransportManagerTableRow>[] = [
  { 
    key: "fullName", 
    title: "Full Name",
    render: (row) => (
      <span className="font-medium text-gray-900">{row.fullName}</span>
    ),
  },
  { 
    key: "_id", 
    title: "Manager ID",
    render: (row) => (
      <span className="text-sm text-gray-500 font-mono">{row._id.slice(-8)}</span>
    ),
  },
];

interface TransportManagerTableProps {
  data: TransportManagerTableRow[];
  onAddManager: () => void;
  onRequestJoinTeam: (managerId: string) => void;
  onLeaveManagerRequest: (managerId: string) => void;
}

export default function TransportManagerTable({ 
  data, 
  onAddManager,
  onRequestJoinTeam,
  onLeaveManagerRequest 
}: TransportManagerTableProps) {
  
  // Row actions for each manager
  const rowActions: TableAction<TransportManagerTableRow>[] = [
    {
      label: "Request Join Team",
      onClick: (row) => onRequestJoinTeam(row._id),
      icon: <LogIn className="h-4 w-4" />,
      variant: "default",
   

    },
    {
      label: "Leave Request",
      onClick: (row) => onLeaveManagerRequest(row._id),
      icon: <LogOut className="h-4 w-4" />,
      variant: "secondary",


    },
  ];

  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "Transport Managers",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Manager",
          className: "bg-primary hover:bg-primary/90 text-white rounded-md px-4 py-2 text-sm font-medium",
          onClick: onAddManager,
          icon: <UserPlus className="h-4 w-4 mr-2" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <UniversalTable<TransportManagerTableRow>
        data={data}
        columns={columns}
        rowKey={(row) => row._id}
        headerActionGroups={headerActionGroups}
        actions={rowActions}
        actionsPosition="end"
      />
    </div>
  );
}