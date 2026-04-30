"use client";

import UniversalTable from "@/components/universal-table/UniversalTable";
import { Column } from "@/components/universal-table/table.types";
import { ClientRow } from "@/lib/clients/client.types";
import { UserPlus } from "lucide-react";
import type { HeaderActionGroup } from "@/components/universal-table/UniversalTable";
import { Button } from "@/components/ui/button";

/** Flat row type used by the table */
export interface ClientTableRow {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  joinedAt: string;
}

/** Map API response → flat rows */
export function toTableRows(rows: ClientRow[]): ClientTableRow[] {
  return rows.map((r) => ({
    _id: r.client._id,
    fullName: r.client.fullName,
    email: r.client.email,
    phone: r.client.phone || "—",
    status: r.status,
    joinedAt: r.approvedAt
      ? new Date(r.approvedAt).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—",
  }));
}

const columns: Column<ClientTableRow>[] = [
  { key: "fullName", title: "Full Name" },
  { key: "email", title: "Email" },
  { key: "phone", title: "Phone" },
  {
    key: "status",
    title: "Status",
    render: (row) => (
      <span
        className={
          row.status === "approved"
            ? "font-medium text-green-600 capitalize"
            : row.status === "pending"
              ? "font-medium text-yellow-600 capitalize"
              : "text-muted-foreground font-medium capitalize"
        }
      >
        {row.status}
      </span>
    ),
  },
  { key: "joinedAt", title: "Joined At" },
];

interface ClientsTableProps {
  data: ClientTableRow[];
  onAddClient: () => void;
  onRequestRemove: (row: ClientTableRow) => void;
  removingClientId?: string | null;
}

export default function ClientsTable({
  data,
  onAddClient,
  onRequestRemove,
  removingClientId,
}: ClientsTableProps) {
  const totalClients = data.length;

  console.log("Total clients:", totalClients);
  const tableColumns: Column<ClientTableRow>[] = [
    ...columns,
    {
      key: "_id",
      title: "Actions",
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 hover:bg-red-50"
          onClick={() => onRequestRemove(row)}
          disabled={removingClientId === row._id}
        >
          {removingClientId === row._id ? "Submitting..." : "Remove"}
        </Button>
      ),
    },
  ];

  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Client",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddClient,
          icon: <UserPlus className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  return (
    <UniversalTable<ClientTableRow>
      data={data}
      columns={tableColumns}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
