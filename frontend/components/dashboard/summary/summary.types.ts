import { LucideIcon } from "lucide-react";

export interface SummaryCardData {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: string;
}

export interface FleetUtilizationData {
  name: string;
  value: number;
  color: string;
}
