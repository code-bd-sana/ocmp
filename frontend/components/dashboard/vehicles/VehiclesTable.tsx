"use client";

import UniversalTable from "@/components/universal-table/UniversalTable";
import { Column, TableAction } from "@/components/universal-table/table.types";
import { VehicleRow, VehicleStatus } from "@/lib/vehicles/vehicle.types";
import { Eye, Pencil, Trash2, CarFront } from "lucide-react";
import type { HeaderActionGroup } from "@/components/universal-table/UniversalTable";

/** Flat row type used by the vehicles table */
export interface VehicleTableRow {
  _id: string;
  vehicleRegId: string;
  vehicleType: string;
  licensePlate: string;
  diskNumber: string;
  status: VehicleStatus;
  lastServiceDate: string;
  nextServiceDate: string;
  dateLeft: string;
  vedExpiry: string;
  insuranceExpiry: string;
  serviceDueDate: string;
}

function formatDate(value?: string | Date): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDynamicStatus(nextServiceDate?: string | Date): VehicleStatus {
  if (!nextServiceDate) return VehicleStatus.OVERDUE;

  const targetDate = new Date(nextServiceDate);
  if (Number.isNaN(targetDate.getTime())) return VehicleStatus.OVERDUE;

  const dayInMs = 24 * 60 * 60 * 1000;
  const diffInDays = (targetDate.getTime() - Date.now()) / dayInMs;

  if (diffInDays > 30) return VehicleStatus.ACTIVE;
  if (diffInDays > 0) return VehicleStatus.UPCOMING;
  return VehicleStatus.OVERDUE;
}

/** Map API response → flat table rows */
export function toVehicleTableRows(vehicles: VehicleRow[]): VehicleTableRow[] {
  return vehicles.map((v) => {
    const nextServiceDate = v.additionalDetails?.nextServiceDate;

    return {
      _id: v._id,
      vehicleRegId: v.vehicleRegId,
      vehicleType: v.vehicleType,
      licensePlate: v.licensePlate,
      diskNumber: v.additionalDetails?.diskNumber || "—",
      status: getDynamicStatus(nextServiceDate),
      lastServiceDate: formatDate(v.additionalDetails?.lastServiceDate),
      nextServiceDate: formatDate(nextServiceDate),
      dateLeft: formatDate(v.additionalDetails?.dateLeft),
      vedExpiry: formatDate(v.additionalDetails?.vedExpiry),
      insuranceExpiry: formatDate(v.additionalDetails?.insuranceExpiry),
      serviceDueDate: formatDate(v.additionalDetails?.serviceDueDate),
    };
  });
}

const columns: Column<VehicleTableRow>[] = [
  { key: "vehicleRegId", title: "Reg ID" },
  { key: "vehicleType", title: "Vehicle Type" },
  { key: "licensePlate", title: "License Plate" },
  { key: "diskNumber", title: "Disk Number" },
  {
    key: "status",
    title: "Status",
    render: (row) => (
      <span
        className={
          row.status === VehicleStatus.ACTIVE
            ? "font-medium text-green-600"
            : row.status === VehicleStatus.OVERDUE
              ? "font-medium text-red-500"
              : row.status === VehicleStatus.UPCOMING
                ? "font-medium text-yellow-600"
                : "font-medium text-gray-600"
        }
      >
        {row.status}
      </span>
    ),
  },
  { key: "lastServiceDate", title: "Last Service" },
  { key: "nextServiceDate", title: "Next Service" },
  { key: "dateLeft", title: "Date Left" },
  { key: "vedExpiry", title: "VED Expiry" },
  { key: "insuranceExpiry", title: "Ins. Expiry" },
  { key: "serviceDueDate", title: "Service Due" },
];

interface VehiclesTableProps {
  data: VehicleTableRow[];
  onAddVehicle: () => void;
  onView: (row: VehicleTableRow) => void;
  onEdit: (row: VehicleTableRow) => void;
  onDelete: (row: VehicleTableRow) => void;
}

export default function VehiclesTable({
  data,
  onAddVehicle,
  onView,
  onEdit,
  onDelete,
}: VehiclesTableProps) {
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
          csvFileName: "vehicle-list",
          visibility: true,
          positionIndex: 0,
        },
        {
          label: "Add Vehicle",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddVehicle,
          icon: <CarFront className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<VehicleTableRow>[] = [
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
    <UniversalTable<VehicleTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}