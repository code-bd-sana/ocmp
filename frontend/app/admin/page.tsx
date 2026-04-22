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
  email: string;
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
    className={`inline-flex min-w-22.5 items-center justify-center rounded-xs border px-2 py-1 text-xs font-medium whitespace-nowrap sm:min-w-27.5 sm:px-3 sm:text-sm md:text-base ${
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        if (isMounted) {
          setIsLoading(true);
        }

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
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
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
        title: "Total Standalone Users",
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
        email: item.email,
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
    {
      key: "fullName",
      title: "NAME",
      render: (row) => (
        <span className="block max-w-42.5 truncate text-sm font-medium sm:max-w-55 md:max-w-65 md:text-base">
          {row.fullName}
        </span>
      ),
    },
    {
      key: "email",
      title: "EMAIL",
      render: (row) => (
        <span className="block max-w-45 truncate text-sm sm:max-w-55 md:max-w-70 md:text-base">
          {row.email}
        </span>
      ),
    },
    {
      key: "role",
      title: "ROLE",
      render: (row) => (
        <span className="text-sm whitespace-nowrap md:text-base">
          {formatRole(row.role)}
        </span>
      ),
    },
    {
      key: "lastLogin",
      title: "LAST LOGIN",
      render: (row) => (
        <span className="text-sm whitespace-nowrap md:text-base">
          {formatDateTime(row.lastLogin)}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "REGISTERED DATE",
      render: (row) => (
        <span className="text-sm whitespace-nowrap md:text-base">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: "isActive",
      title: "STATUS",
      render: (row) => <StatusBadge isActive={row.isActive} />,
    },
  ];

  const transportManagerOverviewColumns: Column<TransportManagerOverviewRow>[] = [
    {
      key: "fullName",
      title: "NAME",
      render: (row) => (
        <span className="block max-w-42.5 truncate text-sm font-medium sm:max-w-55 md:max-w-65 md:text-base">
          {row.fullName}
        </span>
      ),
    },
    {
      key: "email",
      title: "EMAIL",
      render: (row) => (
        <span className="block max-w-45 truncate text-sm sm:max-w-55 md:max-w-70 md:text-base">
          {row.email}
        </span>
      ),
    },
    {
      key: "assignedVehicle",
      title: "ASSIGNED VEHICLES",
      render: (row) => (
        <span className="text-sm whitespace-nowrap md:text-base">
          {String(row.assignedVehicle)}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "REGISTERED DATE",
      render: (row) => (
        <span className="text-sm whitespace-nowrap md:text-base">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: "isActive",
      title: "STATUS",
      render: (row) => <StatusBadge isActive={row.isActive} />,
    },
  ];

  const clientOverviewColumns: Column<ClientOverviewRow>[] = [
    {
      key: "fullName",
      title: "NAME",
      render: (row) => (
        <span className="block max-w-42.5 truncate text-sm font-medium sm:max-w-55 md:max-w-65 md:text-base">
          {row.fullName}
        </span>
      ),
    },
    {
      key: "email",
      title: "EMAIL",
      render: (row) => (
        <span className="block max-w-45 truncate text-sm sm:max-w-55 md:max-w-70 md:text-base">
          {row.email}
        </span>
      ),
    },
    {
      key: "lastLogin",
      title: "LAST LOGIN",
      render: (row) => (
        <span className="text-sm whitespace-nowrap md:text-base">
          {formatDateTime(row.lastLogin)}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "REGISTERED DATE",
      render: (row) => (
        <span className="text-sm whitespace-nowrap md:text-base">
          {formatDateTime(row.createdAt)}
        </span>
      ),
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
            "rounded-none bg-[#0d4b9f] px-4 py-2 text-sm text-white hover:bg-[#0a3e85] sm:px-6",
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
            "rounded-none bg-[#0d4b9f] px-4 py-2 text-sm text-white hover:bg-[#0a3e85] sm:px-6",
          positionIndex: 1,
        },
      ],
    },
  ];

  const clientOverviewHeaderActionGroups: HeaderActionGroup[] = [
    {
      title: "Standalone User Overview",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "View All",
          onClick: () => router.push("/admin/all-clients"),
          visibility: true,
          className:
            "rounded-none bg-[#0d4b9f] px-4 py-2 text-sm text-white hover:bg-[#0a3e85] sm:px-6",
          positionIndex: 1,
        },
      ],
    },
  ];

  return (
    <div className="bg-white">
      <h1 className="mb-6 text-3xl leading-tight font-medium text-[#0d4b9f] sm:text-4xl md:mb-10 md:text-5xl">
        Main Dashboard
      </h1>

      <Card className="rounded-sm border-none bg-[#f8f9fc] shadow-[0_6px_18px_rgba(13,75,159,0.08)]">
        <CardContent className="p-4 sm:p-5 md:p-6">
          <h2 className="pb-4 text-2xl leading-tight font-medium text-[#0d4b9f] sm:text-3xl md:pb-8 md:text-4xl">
            Summary
          </h2>

          {isLoading && !dashboardData ? (
            <div className="flex min-h-56 items-center justify-center rounded-sm bg-white text-base text-[#8F8F8F] sm:text-lg">
              <span
                className="h-9 w-9 animate-spin rounded-full border-3 border-[#0d4b9f]/25 border-t-[#0d4b9f]"
                aria-label="Loading"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-8">
              {adminStats.map((item) => (
                <div
                  key={item.title}
                  className={`${item.bg} flex min-h-40 flex-col justify-center rounded-none px-4 py-4 sm:min-h-44 sm:px-5 sm:py-5 md:min-h-56 md:py-6`}
                >
                  <item.icon className="mb-4 h-7 w-7 text-[#0d4b9f] sm:h-8 sm:w-8 md:mb-5" strokeWidth={1.8} />
                  <p className="mb-2 text-base font-medium text-[#0d4b9f] sm:text-[18px]">
                    {item.title}
                  </p>
                  <p className="text-3xl leading-none font-bold text-[#0d4b9f] sm:text-[34px]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <section className="mt-6 space-y-4 sm:mt-8 sm:space-y-6">
        {isLoading && !dashboardData ? (
          <div className="flex min-h-48 items-center justify-center rounded-sm bg-[#f8f9fc] text-base text-[#8F8F8F] sm:text-lg">
            <span
              className="h-9 w-9 animate-spin rounded-full border-3 border-[#0d4b9f]/25 border-t-[#0d4b9f]"
              aria-label="Loading"
            />
          </div>
        ) : (
          <>
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
          </>
        )}
      </section>
    </div>
  );
}
