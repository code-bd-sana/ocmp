"use client";

import { Calendar, XCircle, Plus } from "lucide-react";
import { PlannerRow, RequestStatus } from "@/lib/planner/planner.types";
import { EVENT_COLORS, VehicleMapValue } from "./types";

interface EventsSidebarProps {
  selectedDay: number | null;
  monthLabel: string;
  selectedDayRows: PlannerRow[];
  loading: boolean;
  vehicleMap: Map<string, VehicleMapValue>;
  onSelectDay: (day: number | null) => void;
  onOpenEventDetails: (row: PlannerRow, day: number) => void;
  onOpenAddEvent: () => void;
  currentMonth: Date;
}

function labelForPlannerType(type: string): string {
  return String(type)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function asDisplayDate(dateLike?: string): string {
  if (!dateLike) return "-";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getVehicleId(vehicleId: PlannerRow["vehicleId"]): string {
  if (typeof vehicleId === "string") return vehicleId;
  return vehicleId?._id || "";
}

function plannerEventType(
  row: PlannerRow,
): "completed" | "in-progress" | "booked" | "overdue" {
  if (row.PlannerStatus === "DUE") return "overdue";
  if (row.requestStatus === RequestStatus.PENDING) return "in-progress";
  if (row.requestStatus === RequestStatus.APPROVED) return "completed";
  return "booked";
}

export function EventsSidebar({
  selectedDay,
  monthLabel,
  selectedDayRows,
  loading,
  vehicleMap,
  onSelectDay,
  onOpenEventDetails,
  onOpenAddEvent,
}: EventsSidebarProps) {
  return (
    <div className="overflow-hidden bg-white shadow-xl">
      <div className="bg-primary px-5 py-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            <h2 className="font-semibold">
              {selectedDay ? `${selectedDay} ${monthLabel}` : "Select a Day"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {selectedDay && (
              <button
                onClick={onOpenAddEvent}
                className="rounded p-1 transition-all hover:bg-white/10"
                title="Add new event for this day"
              >
                <Plus size={18} />
              </button>
            )}
            {selectedDay && (
              <button
                onClick={() => onSelectDay(null)}
                className="rounded p-1 hover:bg-white/10"
              >
                <XCircle size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto p-4 xl:max-h-150">
        {!selectedDay ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar size={48} className="text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              Click on any day to view events
            </p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-400">Loading events...</div>
          </div>
        ) : selectedDayRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar size={48} className="text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No events scheduled</p>
            <button
              onClick={onOpenAddEvent}
              className="mt-3 rounded-lg bg-[#044192] px-3 py-1.5 text-xs text-white hover:bg-blue-800"
            >
              + Add Event
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDayRows.map((row) => {
              const vId = getVehicleId(row.vehicleId);
              const vehicleInfo = vehicleMap.get(vId);
              const eventType = plannerEventType(row);

              return (
                <button
                  key={row._id}
                  onClick={() => onOpenEventDetails(row, selectedDay)}
                  className={`w-full rounded-xl border p-3 text-left transition-all hover:shadow-md ${EVENT_COLORS[eventType].light}`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`rounded-lg p-1.5 ${EVENT_COLORS[eventType].bg}`}
                    >
                      <div className="h-3 w-3 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {labelForPlannerType(row.plannerType)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-600">
                        {vehicleInfo?.label}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {asDisplayDate(row.plannerDate)}
                      </p>
                      {row.requestStatus === RequestStatus.PENDING && (
                        <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          Pending Request
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
