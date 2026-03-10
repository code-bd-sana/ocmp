"use client";

import { Column, TableAction } from "@/components/universal-table/table.types";
import UniversalTable, {
  HeaderActionGroup,
} from "@/components/universal-table/UniversalTable";
import { trafficCommissionerRow } from "@/lib/traffic-commissioner/traffic-commissioner.type";
import { Eye, Pencil, Trash2, MessageSquare } from "lucide-react";

export interface TrafficCommissionerTableRow {
  _id: string;
  type: string;
  contactedPerson: string;
  reason: string;
  communicationDate: string;
  attachments?: string[];
  comments?: string;
  standAloneId?: string;
  createdBy?: string;
}

/** Map API response → flat table rows */
export function toTrafficCommissionerTableRows(
  communications: trafficCommissionerRow[],
): TrafficCommissionerTableRow[] {
  return communications.map((comm) => ({
    _id: comm._id,
    type: comm.type,
    contactedPerson: comm.contactedPerson,
    reason: comm.reason,
    communicationDate: new Date(comm.communicationDate).toLocaleDateString(),
    attachments: comm.attachments || [],
    comments: comm.comments || "—",
    standAloneId: comm.standAloneId || "",
    createdBy: comm.createdBy || "",
  }));
}

const columns: Column<TrafficCommissionerTableRow>[] = [
  { key: "type", title: "Type" },
  { key: "contactedPerson", title: "Contacted Person" },
  { key: "reason", title: "Reason" },
  { key: "communicationDate", title: "Date" },
  { key: "comments", title: "Comments" },
];

interface CommissionerTableProps {
  data: TrafficCommissionerTableRow[];
  onAddTrafficCommissioner: () => void;
  onView: (row: TrafficCommissionerTableRow) => void;
  onEdit: (row: TrafficCommissionerTableRow) => void;
  onDelete: (row: TrafficCommissionerTableRow) => void;
}

export default function CommissionerTable({
  data,
  onAddTrafficCommissioner,
  onView,
  onEdit,
  onDelete,
}: CommissionerTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Traffic Commissioner Communication",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddTrafficCommissioner,
          icon: <MessageSquare className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<TrafficCommissionerTableRow>[] = [
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
    <UniversalTable<TrafficCommissionerTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
