import { PlannerType } from "@/lib/planner/planner.types";

export type EventType = "completed" | "in-progress" | "booked" | "overdue";

export interface VehicleOption {
  _id: string;
  vehicleRegId?: string;
  licensePlate?: string;
  make?: string;
  model?: string;
}

export interface VehicleMapValue {
  label: string;
  make?: string;
  model?: string;
}

export const EVENT_COLORS = {
  completed: {
    bg: "bg-gradient-to-br from-green-500 to-green-600",
    light: "bg-green-50 border-green-200",
    text: "text-green-700",
  },
  "in-progress": {
    bg: "bg-gradient-to-br from-orange-500 to-orange-600",
    light: "bg-orange-50 border-orange-200",
    text: "text-orange-700",
  },
  booked: {
    bg: "bg-gradient-to-br from-blue-500 to-blue-600",
    light: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
  },
  overdue: {
    bg: "bg-gradient-to-br from-pink-500 to-pink-600",
    light: "bg-pink-50 border-pink-200",
    text: "text-pink-700",
  },
};

export const PLANNER_TYPE_COLORS: Record<
  PlannerType,
  { dayBg: string; accent: string }
> = {
  [PlannerType.INSPECTIONS]: {
    dayBg: "bg-blue-100",
    accent: "border-blue-300",
  },
  [PlannerType.SERVICE]: {
    dayBg: "bg-orange-100",
    accent: "border-orange-300",
  },
  [PlannerType.MOT]: { dayBg: "bg-green-100", accent: "border-green-300" },
  [PlannerType.BRAKE_TEST]: {
    dayBg: "bg-purple-100",
    accent: "border-purple-300",
  },
  [PlannerType.REPAIR]: { dayBg: "bg-red-100", accent: "border-red-300" },
  [PlannerType.TACHO_RECALIBRATION]: {
    dayBg: "bg-cyan-100",
    accent: "border-cyan-300",
  },
  [PlannerType.VED]: { dayBg: "bg-amber-100", accent: "border-amber-300" },
};
