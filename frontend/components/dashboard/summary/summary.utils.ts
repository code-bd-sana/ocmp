import { SummaryCardData, FleetUtilizationData } from "./summary.types";
import { Truck, Briefcase, User, AlertTriangle, UserCheck } from "lucide-react";

export const getSummaryData = (
  role?: string | null,
  params?: {
    totalClients?: number;
    totalDrivers?: number;
    totalVehicles?: number;
    totalEvents?: number;
    transportManagerName?: string;
  },
): SummaryCardData[] => {
  if (role === "TRANSPORT_MANAGER") {
    return [
      {
        title: "Total Clients",
        value: typeof params?.totalClients === "number" ? params.totalClients : 0,
        icon: Briefcase,
        color: "var(--dashboard-vehicle-driver-bg)",
      },
      {
        title: "Total Vehicles",
        value: typeof params?.totalVehicles === "number" ? params.totalVehicles : 0,
        icon: Truck,
        color: "var(--dashboard-job-alert-card-bg)",
      },
      {
        title: "Total Drivers",
        value: typeof params?.totalDrivers === "number" ? params.totalDrivers : 0,
        icon: User,
        color: "var(--dashboard-vehicle-driver-bg)",
      },
      {
        title: "Total Events",
        value: typeof params?.totalEvents === "number" ? params.totalEvents : 0,
        icon: AlertTriangle,
        color: "var(--dashboard-job-alert-card-bg)",
      },
    ];
  }

  if (role === "STANDALONE_USER") {
    return [
      {
        title: "Transport Manager",
        value: params?.transportManagerName || "None",
        icon: UserCheck,
        color: "var(--dashboard-vehicle-driver-bg)",
      },
      {
        title: "Total Vehicles",
        value: typeof params?.totalVehicles === "number" ? params.totalVehicles : 0,
        icon: Truck,
        color: "var(--dashboard-job-alert-card-bg)",
      },
      {
        title: "Total Drivers",
        value: typeof params?.totalDrivers === "number" ? params.totalDrivers : 0,
        icon: User,
        color: "var(--dashboard-vehicle-driver-bg)",
      },
      {
        title: "Total Events",
        value: typeof params?.totalEvents === "number" ? params.totalEvents : 0,
        icon: AlertTriangle,
        color: "var(--dashboard-job-alert-card-bg)",
      },
    ];
  }

  // Default / SUPER_ADMIN (or fallback)
  return [
    {
      title: "Total Clients",
      value: typeof params?.totalClients === "number" ? params.totalClients : 0,
      icon: Briefcase,
      color: "var(--dashboard-vehicle-driver-bg)",
    },
    {
      title: "Total Vehicles",
      value: typeof params?.totalVehicles === "number" ? params.totalVehicles : 0,
      icon: Truck,
      color: "var(--dashboard-job-alert-card-bg)",
    },
    {
      title: "Total Drivers",
      value: typeof params?.totalDrivers === "number" ? params.totalDrivers : 0,
      icon: User,
      color: "var(--dashboard-vehicle-driver-bg)",
    },
    {
      title: "Total Events",
      value: typeof params?.totalEvents === "number" ? params.totalEvents : 0,
      icon: AlertTriangle,
      color: "var(--dashboard-job-alert-card-bg)",
    },
  ];
};

export const getFleetUtilizationData = (): FleetUtilizationData[] => [
  { name: "Active Utilization", value: 62, color: "#22c55e" },
  { name: "Idle Vehicles", value: 23, color: "#ef4444" },
  { name: "Maintenance", value: 15, color: "#eab308" },
];
