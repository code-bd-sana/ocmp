import { SummaryCardData, FleetUtilizationData } from "./summary.types";
import { Truck, Briefcase, User, AlertTriangle } from "lucide-react";

export const getSummaryData = (): SummaryCardData[] => [
  {
    title: "Total Vehicles",
    value: 128,
    icon: Truck, //as fallback
    color: "var(--dashboard-vehicle-driver-bg)",
  },
  {
    title: "Active Job",
    value: 38,
    icon: Briefcase,
    color: "var(--dashboard-job-alert-card-bg)",
  },
  {
    title: "Driver Online",
    value: 12,
    icon: User,
    color: "var(--dashboard-vehicle-driver-bg)",
  },
  {
    title: "Alerts",
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
