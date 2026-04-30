import { SummaryCardData, FleetUtilizationData } from "./summary.types";
import { Truck, Briefcase, User, AlertTriangle } from "lucide-react";
import { ClientAction } from "@/service/client";

/**
 * Fetch total clients count for the authenticated Transport Manager.
 * Uses the paginated endpoint but requests a single page and reads `totalData`.
 */
export const fetchTotalClientsCount = async (): Promise<number> => {
  try {
    const res = await ClientAction.getClients({ showPerPage: 1, pageNo: 1 });
    if (
      res &&
      res.status &&
      res.data &&
      typeof res.data.totalData === "number"
    ) {
      return res.data.totalData;
    }
    console.warn("fetchTotalClientsCount: unexpected response", res);
    return 0;
  } catch (err) {
    console.error("fetchTotalClientsCount error:", err);
    return 0;
  }
};

export const getSummaryData = (totalClients?: number): SummaryCardData[] => [
  {
    title: "Total Clients",
    value: typeof totalClients === "number" ? totalClients : 0,
    icon: Truck,
    color: "var(--dashboard-vehicle-driver-bg)",
  },
  {
    title: "Total Drivers",
    value: 38,
    icon: Briefcase,
    color: "var(--dashboard-job-alert-card-bg)",
  },
  {
    title: "Total Vehicles",
    value: 12,
    icon: User,
    color: "var(--dashboard-vehicle-driver-bg)",
  },
  {
    title: "Total Events",
    value: 20,
    icon: AlertTriangle,
    color: "var(--dashboard-job-alert-card-bg)",
  },
];

export const getFleetUtilizationData = (): FleetUtilizationData[] => [
  { name: "Active Utilization", value: 62, color: "#22c55e" },
  { name: "Idle Vehicles", value: 23, color: "#ef4444" },
  { name: "Maintenance", value: 15, color: "#eab308" },
];
