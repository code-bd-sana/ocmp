import { PlannerRow, RequestStatus } from "@/lib/planner/planner.types";

export function asInputDate(dateLike: string | Date): string {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function asDisplayDate(dateLike?: string): string {
  if (!dateLike) return "-";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function labelForPlannerType(type: string): string {
  return String(type)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function getVehicleId(vehicleId: PlannerRow["vehicleId"]): string {
  if (typeof vehicleId === "string") return vehicleId;
  return vehicleId?._id || "";
}

export function plannerEventType(
  row: PlannerRow,
): "completed" | "in-progress" | "booked" | "overdue" {
  if (row.PlannerStatus === "DUE") return "overdue";
  if (row.requestStatus === RequestStatus.PENDING) return "in-progress";
  if (row.requestStatus === RequestStatus.APPROVED) return "completed";
  return "booked";
}
