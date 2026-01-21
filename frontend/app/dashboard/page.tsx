"use client";

import DashboardHome from "@/components/dashboard/dashboard-home";
import { Column, TableAction } from "@/components/universal-table/table.types";
import UniversalTable from "@/components/universal-table/UniversalTable";
import { Edit, Trash } from "lucide-react";

type Vehicle = {
  id: string;
  driver: string;
  status: string;
};

const columns: Column<Vehicle>[] = [
  { key: "id", title: "Vehicle ID" },
  { key: "driver", title: "Driver" },
  {
    key: "status",
    title: "Status",
    render: (row) => <span className='font-semibold'>{row.status}</span>,
  },
];

const actions: TableAction<Vehicle>[] = [
  {
    label: "Edit",
    onClick: (row) => console.log("Edit", row),
    icon: <Edit size={16} />,
  },
  {
    label: "Delete",
    onClick: (row) => console.log("Delete", row),
    variant: "destructive",
    icon: <Trash size={16} />,
  },
];

const data: Vehicle[] = [
  { id: "V001", driver: "John Doe", status: "Active" },
  { id: "V002", driver: "Jane Smith", status: "Idle" },
];

export default function page() {
  return (
    <div className='pt-5 bg-white'>
      <DashboardHome />
      <UniversalTable
        data={data}
        columns={columns}
        actions={actions}
        rowKey={(row) => row.id}
        title='Vehicle Overview'
        filterable
        filterOptions={["Active", "Idle", "Maintenance"]}
        headerButtons={[
          {
            label: "Header Add",
            onClick: () => console.log("Header Add"),
            className: "bg-[#044192] text-white",
          },
          {
            label: "Header Export",
            onClick: () => console.log("Header Export"),
            className: "bg-[#27AE60] text-white",
          },
        ]}
        inlineButtons={[
          {
            label: "View All",
            onClick: () => console.log("Inline View"),
            variant: "default",
          },
          {
            label: "Refresh",
            onClick: () => console.log("Inline Refresh"),
            variant: "secondary",
          },
        ]}
        headerSearch={{
          placeholder: "Search header...",
          onChange: (val) => console.log("Header search:", val),
        }}
        inlineSearch={{
          placeholder: "Search table...",
          onChange: (val) => console.log("Inline search:", val),
        }}
      />
    </div>
  );
}
