// vehicleId: mongoose.Types.ObjectId;
// driverId: mongoose.Types.ObjectId;
// date: Date;
// adBlueUsed?: Number;
// fuelUsed?: Number;
// standAloneId?: mongoose.Types.ObjectId;
// createdBy: mongoose.Types.ObjectId;

import { Column, TableAction } from "@/components/universal-table/table.types";
import UniversalTable, {
  HeaderActionGroup,
} from "@/components/universal-table/UniversalTable";

import { Clock, Eye, Pencil, Trash2 } from "lucide-react";
import { FuelUsageRow } from "@/lib/fuel-usage/fuel-usage.types";

export interface FuelUsageTableRow {
  _id: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleRegId: string;
  date: string;
  adBlueUsed: number;
  fuelUsed: number;
  createdBy: string;
}

export function toFuelUsageTableRows(
  items: FuelUsageRow[],
): FuelUsageTableRow[] {
  return items.map((item) => ({
    _id: item._id,
    driverId: item.driverId,
    driverName: item.driver?.fullName || "",
    vehicleId: item.vehicleId,
    vehicleRegId: item.vehicle?.vehicleRegId || "",
    date: item.date,
    adBlueUsed: item.adBlueUsed ?? 0,
    fuelUsed: item.fuelUsed ?? 0,
    createdBy: item.createdBy,
  }));
}

// COLUMNS

const columns: Column<FuelUsageTableRow>[] = [
  { key: "driverName", title: "Driver" },
  { key: "vehicleRegId", title: "Vehicle" },
  { key: "date", title: "Date" },
  { key: "adBlueUsed", title: "AdBlue Used (L)" },
  { key: "fuelUsed", title: "Fuel Used (L)" },
];

// COMPONENTS

interface FuelUsageTableProps {
  data: FuelUsageTableRow[];
  onAddFuelUsage: () => void;
  onView: (row: FuelUsageTableRow) => void;
  onEdit: (row: FuelUsageTableRow) => void;
  onDelete: (row: FuelUsageTableRow) => void;
}

export default function FuelUsageTable({
  data,
  onAddFuelUsage,
  onView,
  onEdit,
  onDelete,
}: FuelUsageTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Fuel Usage",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddFuelUsage,
          icon: <Clock className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<FuelUsageTableRow>[] = [
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
    <UniversalTable<FuelUsageTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
