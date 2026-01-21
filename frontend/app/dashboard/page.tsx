"use client";

import DashboardHome from "@/components/dashboard/dashboard-home";

import UniversalTable from "@/components/universal-table/UniversalTable";

// Data type for transportManagers
type TransportManager = {
  name: string;
  assignedVehicles: number;
  registeredDate: string;
  status: string;
};

// Data
const transportManagers: TransportManager[] = [
  {
    name: "Alice Johnson",
    assignedVehicles: 10,
    registeredDate: "25 Nov, 10:00AM",
    status: "Active",
  },
  {
    name: "Mark Davis",
    assignedVehicles: 8,
    registeredDate: "25 Nov, 10:00AM",
    status: "Inactive",
  },
  {
    name: "Sarah Lee",
    assignedVehicles: 4,
    registeredDate: "25 Nov, 10:00AM",
    status: "Active",
  },
  {
    name: "Bob Green",
    assignedVehicles: 7,
    registeredDate: "25 Nov, 10:00AM",
    status: "Active",
  },
  {
    name: "Mark Davis",
    assignedVehicles: 5,
    registeredDate: "25 Nov, 10:00AM",
    status: "Active",
  },
];

// Define the columns with proper type for accessor
const columns: { title: string; accessor: keyof TransportManager }[] = [
  { title: "Name", accessor: "name" },
  { title: "Assigned Vehicles", accessor: "assignedVehicles" },
  { title: "Registered Date", accessor: "registeredDate" },
  { title: "Status", accessor: "status" },
];

export default function page() {
  return (
    <div className="pt-5 bg-white">
      <DashboardHome />
      <UniversalTable columns={columns} data={transportManagers} />
    </div>
  );
}
