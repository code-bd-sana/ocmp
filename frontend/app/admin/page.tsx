"use client";

import UniversalTable, {
  HeaderActionGroup,
} from "@/components/universal-table/UniversalTable";
import { Column } from "@/components/universal-table/table.types";
import { Card, CardContent } from "@/components/ui/card";
import {
  DashboardAction,
  IClientOverviewItem,
  ISuperAdminDashboardData,
  ITransportManagerOverviewItem,
  IUserOverviewItem,
} from "@/service/dashboard";
import { Truck, UserCheck, UserCog, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type UserOverviewRow = {
  _id: string;
  fullName: string;
  role: string;
  lastLogin: string | null;
  createdAt: string;
  isActive: boolean;
};

type TransportManagerOverviewRow = {
  _id: string;
  fullName: string;
  email: string;
  assignedVehicle: number;
  createdAt: string;
  isActive: boolean;
};

type ClientOverviewRow = {
  _id: string;
  fullName: string;
  email: string;
  lastLogin: string | null;
  createdAt: string;
  isActive: boolean;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  const datePart = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });

  const timePart = date
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(" ", "");

  return `${datePart}, ${timePart}`;
};

const formatRole = (role: string) => {
  if (role === "TRANSPORT_MANAGER") return "Transport Manager";
  if (role === "STANDALONE_USER") return "Client";
  if (role === "SUPER_ADMIN") return "Super Admin";
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <span
    className={`inline-flex items-center justify-center rounded-xs border px-12 py-1 text-2xl font-normal ${
      isActive
        ? "border-[#6FCF97] bg-[#EAF9EF] text-[#27AE60]"
        : "border-[#8D8D8D] bg-[#F2F2F2] text-[#1F1F1F]"
    }`}
  >
    {isActive ? "Active" : "In Active"}
  </span>
);

export default function AdminPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] =
    useState<ISuperAdminDashboardData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const response = await DashboardAction.getSuperAdminDashboard();

        if (!isMounted) return;

        if (response.success && response.data) {
          setDashboardData(response.data);
          return;
        }

        toast.error(response.message || "Failed to load dashboard summary");
      } catch (error) {
        if (!isMounted) return;
        const message =
          error instanceof Error ? error.message : "Failed to load dashboard summary";
        toast.error(message);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const adminStats = useMemo(
    () => [
      {
        title: "Total Users",
        value: dashboardData?.summary.totalUsers ?? "--",
        icon: Users,
        bg: "bg-[#FFE2E5]",
      },
      {
        title: "Transport Managers",
        value: dashboardData?.summary.totalManagers ?? "--",
        icon: UserCheck,
        bg: "bg-[#FFF4DE]",
      },
      {
        title: "Total Clients",
        value: dashboardData?.summary.totalClients ?? "--",
        icon: UserCog,
        bg: "bg-[#DCFCE7]",
      },
      {
        title: "Total Vehicles",
        value: dashboardData?.summary.totalVehicles ?? "--",
        icon: Truck,
        bg: "bg-[#F3E8FF]",
      },
    ],
    [dashboardData],
  );

  const userOverviewRows = useMemo<UserOverviewRow[]>(
    () =>
      (dashboardData?.userOverview ?? []).map((item: IUserOverviewItem) => ({
        _id: item._id,
        fullName: item.fullName,
        role: item.role,
        lastLogin: item.lastLogin,
        createdAt: item.createdAt,
        isActive: item.isActive,
      })),
    [dashboardData],
  );

  const transportManagerOverviewRows = useMemo<TransportManagerOverviewRow[]>(
    () =>
      (dashboardData?.transportManagerOverview ?? []).map(
        (item: ITransportManagerOverviewItem) => ({
          _id: item._id,
          fullName: item.fullName,
          email: item.email,
          assignedVehicle: item.assignedVehicle,
          createdAt: item.createdAt,
          isActive: item.isActive,
        }),
      ),
    [dashboardData],
  );

  const clientOverviewRows = useMemo<ClientOverviewRow[]>(
    () =>
      (dashboardData?.clientOverview ?? []).map((item: IClientOverviewItem) => ({
        _id: item._id,
        fullName: item.fullName,
        email: item.email,
        lastLogin: item.lastLogin,
        createdAt: item.createdAt,
        isActive: item.isActive,
      })),
    [dashboardData],
  );

  const userOverviewColumns: Column<UserOverviewRow>[] = [
    { key: "fullName", title: "NAME" },
    {
      key: "role",
      title: "ROLE",
      render: (row) => formatRole(row.role),
    },
    {
      key: "lastLogin",
      title: "LAST LOGIN",
      render: (row) => formatDateTime(row.lastLogin),
    },
    {
      key: "createdAt",
      title: "REGISTERED DATE",
      render: (row) => formatDateTime(row.createdAt),
    },
    {
      key: "isActive",
      title: "STATUS",
      render: (row) => <StatusBadge isActive={row.isActive} />,
    },
  ];

  const transportManagerOverviewColumns: Column<TransportManagerOverviewRow>[] = [
    { key: "fullName", title: "NAME" },
    { key: "email", title: "EMAIL" },
    {
      key: "assignedVehicle",
      title: "ASSIGNED VEHICLES",
      render: (row) => String(row.assignedVehicle),
    },
    {
      key: "createdAt",
      title: "REGISTERED DATE",
      render: (row) => formatDateTime(row.createdAt),
    },
    {
      key: "isActive",
      title: "STATUS",
      render: (row) => <StatusBadge isActive={row.isActive} />,
    },
  ];

  const clientOverviewColumns: Column<ClientOverviewRow>[] = [
    { key: "fullName", title: "NAME" },
    { key: "email", title: "EMAIL" },
    {
      key: "lastLogin",
      title: "LAST LOGIN",
      render: (row) => formatDateTime(row.lastLogin),
    },
    {
      key: "createdAt",
      title: "REGISTERED DATE",
      render: (row) => formatDateTime(row.createdAt),
    },
    {
      key: "isActive",
      title: "STATUS",
      render: (row) => <StatusBadge isActive={row.isActive} />,
    },
  ];

  const userOverviewHeaderActionGroups: HeaderActionGroup[] = [
    {
      title: "User Overview",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "View All",
          onClick: () => router.push("/admin/all-users"),
          visibility: true,
          className:
            "rounded-none bg-[#0d4b9f] px-6 text-white hover:bg-[#0a3e85]",
          positionIndex: 1,
        },
      ],
    },
  ];

  const transportManagerHeaderActionGroups: HeaderActionGroup[] = [
    {
      title: "Transport Manager Overview",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "View All",
          onClick: () => router.push("/admin/transport-manager"),
          visibility: true,
          className:
            "rounded-none bg-[#0d4b9f] px-6 text-white hover:bg-[#0a3e85]",
          positionIndex: 1,
        },
      ],
    },
  ];

  const clientOverviewHeaderActionGroups: HeaderActionGroup[] = [
    {
      title: "Client Overview",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "View All",
          onClick: () => router.push("/admin/all-clients"),
          visibility: true,
          className:
            "rounded-none bg-[#0d4b9f] px-6 text-white hover:bg-[#0a3e85]",
          positionIndex: 1,
        },
      ],
    },
  ];

  return (
    <div className="bg-white">
      <h1 className="text-5xl leading-tight font-medium text-[#0d4b9f] mb-8 md:mb-15">
        Main Dashboard
      </h1>

      <Card className="rounded-sm border-none bg-[#f8f9fc] shadow-[0_6px_18px_rgba(13,75,159,0.08)]">
        <CardContent className="">
          <h2 className="text-4xl leading-tight font-medium text-[#0d4b9f] pb-5 md:pb-10">
            Summary
          </h2>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {adminStats.map((item) => (
              <div
                key={item.title}
                className={`${item.bg} md:min-h-56 flex flex-col justify-center rounded-none px-4 py-5 md:px-5 md:py-6`}
              >
                <item.icon className="mb-5 h-8 w-8 text-[#0d4b9f]" strokeWidth={1.8} />
                <p className="mb-2 text-[18px] font-medium text-[#0d4b9f]">
                  {item.title}
                </p>
                <p className="text-[34px] leading-none font-bold text-[#0d4b9f]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="mt-8 space-y-6">
        <UniversalTable<UserOverviewRow>
          data={userOverviewRows}
          columns={userOverviewColumns}
          rowKey={(row) => row._id}
          headerActionGroups={userOverviewHeaderActionGroups}
        />

        <UniversalTable<TransportManagerOverviewRow>
          data={transportManagerOverviewRows}
          columns={transportManagerOverviewColumns}
          rowKey={(row) => row._id}
          headerActionGroups={transportManagerHeaderActionGroups}
        />

        <UniversalTable<ClientOverviewRow>
          data={clientOverviewRows}
          columns={clientOverviewColumns}
          rowKey={(row) => row._id}
          headerActionGroups={clientOverviewHeaderActionGroups}
        />
      </section>
    </div>
  );
}
