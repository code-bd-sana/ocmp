"use client";

import { Column, TableAction } from "@/components/universal-table/table.types";
import UniversalTable, {
  HeaderActionGroup,
} from "@/components/universal-table/UniversalTable";
import { SelfServiceRow } from "@/lib/self-service/self-service.types";
import { Eye, Link2, Pencil, Plus, Trash2 } from "lucide-react";

export interface SelfServiceTableRow {
  _id: string;
  serviceName: string;
  description: string;
  serviceLink: string;
  standAloneId?: string;
  createdBy?: string;
}

export function toSelfServiceTableRows(
  selfServices: SelfServiceRow[],
): SelfServiceTableRow[] {
  return selfServices.map((service) => ({
    _id: service._id,
    serviceName: service.serviceName,
    description: service.description || "—",
    serviceLink: service.serviceLink || "—",
    standAloneId: service.standAloneId || "",
    createdBy: service.createdBy || "",
  }));
}

const columns: Column<SelfServiceTableRow>[] = [
  { key: "serviceName", title: "Service Name" },
  { key: "description", title: "Description" },
  {
    key: "serviceLink",
    title: "Service Link",
    render: (row) =>
      row.serviceLink && row.serviceLink !== "—" ? (
        <a
          href={row.serviceLink}
          target="_blank"
          rel="noreferrer"
          className="text-primary inline-flex items-center gap-1 underline"
        >
          <Link2 className="h-3.5 w-3.5" />
          Open
        </a>
      ) : (
        "—"
      ),
  },
];

interface SelfServiceTableProps {
  data: SelfServiceTableRow[];
  onAddSelfService: () => void;
  onView: (row: SelfServiceTableRow) => void;
  onEdit: (row: SelfServiceTableRow) => void;
  onDelete: (row: SelfServiceTableRow) => void;
}

export default function SelfServiceTable({
  data,
  onAddSelfService,
  onView,
  onEdit,
  onDelete,
}: SelfServiceTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Self Service",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddSelfService,
          icon: <Plus className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<SelfServiceTableRow>[] = [
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
    <UniversalTable<SelfServiceTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
