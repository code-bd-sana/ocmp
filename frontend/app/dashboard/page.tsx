"use client";

import DashboardHome from "@/components/dashboard/dashboard-home";
import UniversalTable, {
  HeaderActionGroup
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
    render: (row) => <span className='font-semibold'>{row.status}</span>,
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
  { id: "V001", driver: "John Doe", status: "Inactive" },
  { id: "V002", driver: "Jane Smith", status: "Idle" },
  { id: "V003", driver: "Bob Johnson", status: "Maintenance" },
  { id: "V004", driver: "Alice Brown", status: "Active" },
];


const headerActionGroups: HeaderActionGroup[] = [
  {
    title: "Header Title",
    startingActionGroup: [
      {
        label: "Add Vehicle",
        icon: <Trash size={16} />,
        onClick: () => console.log("Header Add"),
        className: "bg-[#044192] text-white",
        variant: "default",
        size: "default",
        position: "left",
        visibility: true,
        positionIndex: 5,
      },
      {
        label: "Export CSV",
        onClick: () => console.log("Header Export"),
        className: "bg-[#27AE60] text-white",
        variant: "secondary",
        size: "sm",
        position: "right",
        visibility: false,
        positionIndex: 2,
      },
      {
        label: "Search",
        onClick: () => console.log("Search Clicked"),
        inputClassName: "bg-blue-700",
        variant: "default",
        size: "sm",
        position: "center",
        visibility: true,
        positionIndex: 0,
        search: true,
      },
      {
        label: "Filter",
        onClick: () => console.log("Filter Clicked"),
        selectTriggerCalssName: "bg-white",
        selectItemClassName: "bg-red-700",
        options: ['Active', 'Idle', 'Maintenance', 'Inactive'],
        visibility: true,
        positionIndex: 1,
        filter: true,
      },
    ],
    endActionGroup: [
      {
        label: "Add Vehicle",
        onClick: () => console.log("Header Add"),
        className: "bg-[#044192] text-white",
        variant: "default",
        size: "default",
        position: "left",
        visibility: true,
        positionIndex: 5,
      },
      {
        label: "Export CSV",
        onClick: () => console.log("Header Export"),
        className: "bg-[#27AE60] text-white",
        variant: "secondary",
        size: "sm",
        position: "right",
        visibility: false,
        positionIndex: 2,
      },
      {
        label: "Search",
        onClick: () => console.log("Search Clicked"),
        className: "bg-[#F0F0F0] text-black",
        inputClassName: "bg-red-700",
        variant: "default",
        size: "sm",
        position: "center",
        visibility: true,
        positionIndex: 0,
        search: true,
      },
      {
        label: "Filter",
        onClick: () => console.log("Filter Clicked"),
        selectTriggerCalssName: "bg-white",
        selectItemClassName: "bg-red-700",
        variant: "secondary",
        size: "sm",
        position: "center",
        options: ['Active', 'Idle', 'Maintenance', 'Inactive'],
        visibility: true,
        positionIndex: 1,
        filter: true,
      },

    ]
  }
];


const innerActionGroup: HeaderActionGroup[] = [
  {
    title: "hello Sung",
    startingActionGroup: [
      {
        label: "Refresh",
        onClick: () => console.log("Refresh Clicked"),
        className: "bg-[#044192] text-white",
        variant: "default",
        size: "default",
        position: "left",
        visibility: true,
        positionIndex: 5,
      },
      {
        label: "View All",
        onClick: () => console.log("View All Clicked"),
        className: "bg-[#27AE60] text-white",
        variant: "secondary",
        size: "sm",
        position: "right",
        visibility: true,
        positionIndex: 2,
      },
      {
        label: "View All",
        onClick: () => console.log("View All Clicked"),
        className: "bg-[#27AE60] text-white",
        variant: "secondary",
        size: "sm",
        position: "right",
        visibility: true,
        positionIndex: 2,
      },
      {
        label: "View All",
        onClick: () => console.log("View All Clicked"),
        className: "bg-[#27AE60] text-white",
        variant: "secondary",
        size: "sm",
        position: "right",
        visibility: true,
        positionIndex: 2,
      },
      {
        label: "View All",
        onClick: () => console.log("View All Clicked"),
        className: "bg-[#27AE60] text-white",
        variant: "secondary",
        size: "sm",
        position: "right",
        visibility: true,
        positionIndex: 2,
      },
      {
        label: "View All",
        onClick: () => console.log("View All Clicked"),
        className: "bg-[#27AE60] text-white",
        variant: "secondary",
        size: "sm",
        position: "right",
        visibility: true,
        positionIndex: 2,
      },
      {
        label: "Search",
        onClick: () => console.log("Search Clicked"),
        className: "bg-[#F0F0F0] text-black",
        inputClassName: "bg-blue-700", // Custom input color for search
        variant: "default",
        size: "sm",
        position: "center",
        visibility: true,
        positionIndex: 0,
        search: true,
      },
      {
        label: "Filter",
        onClick: () => console.log("Filter Clicked"),
        selectTriggerCalssName: "bg-white",  // Custom background for select trigger
        selectItemClassName: "bg-red-700",   // Custom background for select items
        options: ['Active', 'Idle', 'Maintenance', 'Inactive'],
        visibility: true,
        positionIndex: 1,
        filter: true,
      },
    ],
    endActionGroup: [
      {
        label: "Refresh",
        onClick: () => console.log("Refresh Clicked"),
        className: "bg-[#044192] text-white",
        variant: "default",
        size: "default",
        position: "left",
        visibility: true,
        positionIndex: 5,
      },
      {
        label: "View All",
        onClick: () => console.log("View All Clicked"),
        className: "bg-[#27AE60] text-white",
        variant: "secondary",
        size: "sm",
        position: "right",
        visibility: true,
        positionIndex: 2,
      },
      {
        label: "Search",
        onClick: () => console.log("Search Clicked"),
        className: "bg-[#F0F0F0] text-black",
        inputClassName: "bg-red-700", // Custom input color for search
        variant: "default",
        size: "sm",
        position: "center",
        visibility: true,
        positionIndex: 0,
        search: true,
      },
      {
        label: "Filter",
        onClick: () => console.log("Filter Clicked"),
        className: "bg-[#F0F0F0] text-black",
        selectTriggerCalssName: "bg-white",
        selectItemClassName: "bg-red-700",
        options: ['Active', 'Idle', 'Maintenance', 'Inactive'],
        visibility: true,
        positionIndex: 1,
        filter: true,
      },
    ]
  }
];





export default function Page() {




  return (
    <div className='pt-5 bg-white'>
      {/* Dashboard header / overview */}
      <DashboardHome />

      {/* Vehicle Overview Table */}
      <UniversalTable<Vehicle>
        data={data}
        columns={columns}
        actions={actions}
        rowKey={(row) => row.id}
        headerActionGroups={headerActionGroups}
        innerActionGroup={innerActionGroup}
      />
    </div>
  );
}
