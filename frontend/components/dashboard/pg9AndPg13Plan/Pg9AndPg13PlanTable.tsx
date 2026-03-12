"use client";

import { Column, TableAction } from "@/components/universal-table/table.types";
import UniversalTable, {
  HeaderActionGroup,
} from "@/components/universal-table/UniversalTable";
import { Eye, MessageSquare, Pencil, Trash2 } from "lucide-react";

export interface Pg9AndPg13PlanRow {
  _id: string;
  vehicleId: string;
  issueType: string;
  defectDescription?: string;
  clearanceStatus?: string;
  tcContactMade?: boolean;
  maintenanceProvider?: string;
  meetingDate?: string;
  notes?: string;
  followUp?: boolean;
  standAloneId?: string;
  createdBy: string;
}

/** Map API response */
export function toPg9AndPg13PlanRow(plan: Pg9AndPg13PlanRow[]) {
  return plan.map((p) => ({
    _id: p._id,
    vehicleId: p.vehicleId,
    issueType: p.issueType,
    defectDescription: p.defectDescription,
    clearanceStatus: p.clearanceStatus,
    tcContactMade: p.tcContactMade,
    maintenanceProvider: p.maintenanceProvider,
    meetingDate: p.meetingDate
      ? new Date(p.meetingDate).toLocaleDateString()
      : undefined,
    notes: p.notes,
    followUp: p.followUp,
    standAloneId: p.standAloneId,
    createdBy: p.createdBy,
  }));
}

const columns: Column<Pg9AndPg13PlanRow>[] = [
  { key: "vehicleId", title: "Vehicle ID" },
  { key: "issueType", title: "Issue Type" },
  { key: "defectDescription", title: "Defect Description" },
  { key: "clearanceStatus", title: "Clearance Status" },
  { key: "tcContactMade", title: "TC Contact Made" },
  { key: "maintenanceProvider", title: "Maintenance Provider" },
  { key: "meetingDate", title: "Meeting Date" },
  { key: "notes", title: "Notes" },
  { key: "followUp", title: "Follow Up" },
];

interface Pg9AndPg13PlanTableProps {
  data: Pg9AndPg13PlanRow[];
  onPlanClick: () => void;
  onView: (row: Pg9AndPg13PlanRow) => void;
  onEdit: (row: Pg9AndPg13PlanRow) => void;
  onDelete: (row: Pg9AndPg13PlanRow) => void;
}

export default function Pg9AndPg13PlanTable({
  data,
  onPlanClick,
  onView,
  onEdit,
  onDelete,
}: Pg9AndPg13PlanTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Toolbox Session",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onPlanClick,
          icon: <MessageSquare className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<Pg9AndPg13PlanRow>[] = [
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
    <UniversalTable<Pg9AndPg13PlanRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
