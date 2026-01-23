"use client";

import DashboardHome from "@/components/dashboard/dashboard-home";
import UniversalTable, {
  HeaderButton,
  TableSearch,
} from "@/components/universal-table/UniversalTable";
import { Column, TableAction } from "@/components/universal-table/table.types";
import { Edit, Trash } from "lucide-react";

/**
 * Type definition for a vehicle row
 */
type Vehicle = {
  /** Unique vehicle identifier */
  id: string;
  /** Name of the driver */
  driver: string;
  /** Current status of the vehicle */
  status: string;
};

/**
 * Columns configuration for the UniversalTable
 */
const columns: Column<Vehicle>[] = [
  { key: "id", title: "Vehicle ID" },
  { key: "driver", title: "Driver" },
  {
    key: "status",
    title: "Status",
    render: (row) => <span className="font-semibold">{row.status}</span>,
  },
];

/**
 * Row actions for each table entry
 */
const actions: TableAction<Vehicle>[] = [
  {
    label: "Edit",
    onClick: (row) => console.log("Edit", row),
    variant: "edit",
    icon: <Edit size={16} />,
  },
  {
    label: "Delete",
    onClick: (row) => console.log("Delete", row),
    variant: "delete",
    icon: <Trash size={16} />,
  },
];

/**
 * Sample vehicle data
 */
const data: Vehicle[] = [
  { id: "V001", driver: "John Doe", status: "Active" },
  { id: "V002", driver: "Jane Smith", status: "Idle" },
  { id: "V003", driver: "Bob Johnson", status: "Maintenance" },
  { id: "V004", driver: "Alice Brown", status: "Active" },
];

/**
 * Header buttons
 */
const headerButtons: HeaderButton[] = [
  {
    label: "Add Vehicle",
    onClick: () => console.log("Header Add"),
    className: "bg-[#044192] text-white",
  },
  {
    label: "Export CSV",
    onClick: () => console.log("Header Export"),
    className: "bg-[#27AE60] text-white",
  },
];

/**
 * Inline buttons (inside table container)
 */
const inlineButtons: HeaderButton[] = [
  {
    label: "Refresh",
    onClick: () => console.log("Inline Refresh"),
    variant: "secondary",
  },
  {
    label: "View All",
    onClick: () => console.log("Inline View"),
    variant: "default",
  },
];

/**
 * Header search configuration
 */
const headerSearch: TableSearch = {
  placeholder: "Search header...",
  onChange: (val) => console.log("Header search:", val),
  className: "bg-white",
};

/**
 * Inline search configuration
 */
const inlineSearch: TableSearch = {
  placeholder: "Search table...",
  onChange: (val) => console.log("Inline search:", val),
  className: "bg-white",
};

/**
 * Page component
 *
 * Displays the Vehicle Overview table with:
 * - Header + inline search
 * - Header + inline filters
 * - Header + inline buttons
 * - Row actions
 */
export default function Page() {
  return (
    <div className="pt-5 bg-white">
      {/* Dashboard header / overview */}
      <DashboardHome />

      {/* Vehicle Overview Table */}
      <UniversalTable<Vehicle>
        data={data}
        columns={columns}
        actions={actions}
        rowKey={(row) => row.id}
        title="Vehicle Overview"
        /** Filters */
        filterable
        filterOptionsHeader={["Active", "Idle"]}
        filterOptionsInline={["Maintenance"]}
        /** Buttons */
        headerButtons={headerButtons}
        inlineButtons={inlineButtons}
        /** Search */
        headerSearch={headerSearch}
        inlineSearch={inlineSearch}
      />
    </div>
  );
}
