import { Column, TableAction } from "@/components/universal-table/table.types";
import UniversalTable, {
  HeaderActionGroup,
} from "@/components/universal-table/UniversalTable";
import { WorkingTimeDirectiveRow } from "@/lib/working-time-directives/working-time-directive.types";
import { Clock, Eye, Pencil, Trash2 } from "lucide-react";

/* ── flat row for the table ── */

export interface WTDTableRow {
  _id: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleRegId: string;
  workingHours: number;
  restHours: string;
  complianceStatus: string;
  tachoReportAvailable: boolean;
}

export function toWTDTableRows(
  items: WorkingTimeDirectiveRow[],
): WTDTableRow[] {
  return items.map((w) => ({
    _id: w._id,
    driverId: w.driverId ?? w.driver?._id ?? "",
    driverName: w.driver?.fullName || "—",
    vehicleId: w.vehicleId ?? w.vehicle?._id ?? "",
    vehicleRegId: w.vehicle?.vehicleRegId || "—",
    workingHours: w.workingHours,
    restHours: w.restHours !== undefined ? String(w.restHours) : "—",
    complianceStatus: w.complianceStatus || "—",
    tachoReportAvailable: w.tachoReportAvailable ?? false,
  }));
}

/* ── columns ── */

const columns: Column<WTDTableRow>[] = [
  { key: "driverName", title: "Driver" },
  { key: "vehicleRegId", title: "Vehicle" },
  { key: "workingHours", title: "Working Hours" },
  { key: "restHours", title: "Rest Hours" },
  {
    key: "complianceStatus",
    title: "Compliance Status",
    render: (row) => {
      const lower = row.complianceStatus.toLowerCase();
      const color =
        lower === "compliant"
          ? "text-green-600"
          : lower === "non-compliant" || lower === "violation"
            ? "text-red-500"
            : lower === "pending"
              ? "text-yellow-600"
              : "text-foreground";
      return (
        <span className={`font-medium ${color}`}>{row.complianceStatus}</span>
      );
    },
  },
  {
    key: "tachoReportAvailable",
    title: "Tacho Report",
    render: (row) => (
      <span
        className={
          row.tachoReportAvailable
            ? "font-medium text-green-600"
            : "font-medium text-red-500"
        }
      >
        {row.tachoReportAvailable ? "Yes" : "No"}
      </span>
    ),
  },
];

/* ── component ── */

interface WorkingTimeDirectivesTableProps {
  data: WTDTableRow[];
  onAddDirective: () => void;
  onView: (row: WTDTableRow) => void;
  onEdit: (row: WTDTableRow) => void;
  onDelete: (row: WTDTableRow) => void;
}

export default function WorkingTimeDirectivesTable({
  data,
  onAddDirective,
  onView,
  onEdit,
  onDelete,
}: WorkingTimeDirectivesTableProps) {
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
          csvFileName: "working-time-directives",
          visibility: true,
          positionIndex: 0,
        },
        {
          label: "Add Directive",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddDirective,
          icon: <Clock className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<WTDTableRow>[] = [
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
    <UniversalTable<WTDTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
