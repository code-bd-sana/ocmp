"use client";

import { Column, TableAction } from "@/components/universal-table/table.types";
import UniversalTable, {
  HeaderActionGroup,
} from "@/components/universal-table/UniversalTable";
import { Eye, MessageSquare, Pencil, Trash2 } from "lucide-react";

export interface WheelRetorqueRow {
  _id: string;
  vehicleId: string;
  dateChanged?: string;
  tyreSize?: string;
  tyreLocation?: string;
  reTorqueDue?: string;
  reTorqueCompleted?: string;
  technician?: string;
  standAloneId?: string;
  createdBy: string;
}

/**** Map API response ****/
export function toWheelRetorqueRow(data?: WheelRetorqueRow[]) {
  if (!data || !Array.isArray(data)) return [];
  return data.map((d) => ({
    _id: d._id,
    vehicleId: d.vehicleId,
    dateChanged: d.dateChanged
      ? new Date(d.dateChanged).toLocaleDateString()
      : undefined,
    tyreSize: d.tyreSize,
    tyreLocation: d.tyreLocation,
    reTorqueDue: d.reTorqueDue
      ? new Date(d.reTorqueDue).toLocaleDateString()
      : undefined,
    reTorqueCompleted: d.reTorqueCompleted
      ? new Date(d.reTorqueCompleted).toLocaleDateString()
      : undefined,
    technician: d.technician,
    standAloneId: d.standAloneId,
    createdBy: d.createdBy,
  }));
}

const columns: Column<WheelRetorqueRow>[] = [
  { key: "vehicleId", title: "Vehicle ID" },
  { key: "dateChanged", title: "Date Changed" },
  { key: "tyreSize", title: "Tyre Size" },
  { key: "tyreLocation", title: "Tyre Location" },
  { key: "reTorqueDue", title: "Re-Torque Due" },
  { key: "reTorqueCompleted", title: "Re-Torque Completed" },
  { key: "technician", title: "Technician" },
];

interface WheelRetorqueTableProps {
  data: WheelRetorqueRow[];
  onWheelClick: () => void;
  onView: (row: WheelRetorqueRow) => void;
  onEdit: (row: WheelRetorqueRow) => void;
  onDelete: (row: WheelRetorqueRow) => void;
}

export default function WheelRetorqueTable({
  data,
  onWheelClick,
  onView,
  onEdit,
  onDelete,
}: WheelRetorqueTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Wheel Retorque Record",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onWheelClick,
          icon: <MessageSquare className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<WheelRetorqueRow>[] = [
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
    <UniversalTable<WheelRetorqueRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
