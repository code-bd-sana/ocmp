"use client";

import DashboardHome from "@/components/dashboard/dashboard-home";
import { UniversalTable } from "@/components/universal-table/UniversalTable";
import { TableAction } from "@/components/universal-table/table.types";
import { Column } from "@/components/universal-table/table.types";

// -------------------- TYPES --------------------
type User = {
  name: string;
  email: string;
  role: string;
};

// -------------------- DATA --------------------
const users: User[] = [
  { name: "Khalid Ahsan", email: "khalid@gmail.com", role: "Admin" },
  { name: "Rahim", email: "rahim@gmail.com", role: "User" },
  { name: "Karim", email: "karim@gmail.com", role: "User" },
  { name: "Sabbir", email: "sabbir@gmail.com", role: "Moderator" },
];

// -------------------- COLUMNS --------------------
const columns: readonly Column<User>[] = [
  { key: "name", title: "Name", filterable: true },
  { key: "email", title: "Email" },
  { key: "role", title: "Role", filterable: true },
];

// -------------------- ACTIONS --------------------
const actions: TableAction<User>[] = [
  {
    label: "View",
    onClick: (row) => alert(`Viewing ${row.name}`),
  },
  {
    label: "Delete",
    variant: "destructive",
    onClick: (row) => alert(`Deleting ${row.name}`),
  },
];

export default function Page() {
  return (
    <div className="pt-5 bg-white">
      <DashboardHome />
      <UniversalTable<User>
        data={users}
        columns={columns}
        rowKey={(row) => row.email}
        actions={actions}
        pageSize={2}
        searchable
        filterable
      />
    </div>
  );
}
