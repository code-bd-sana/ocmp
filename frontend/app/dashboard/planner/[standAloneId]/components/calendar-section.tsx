"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PlannerRow } from "@/lib/planner/planner.types";
import { PLANNER_TYPE_COLORS, EVENT_COLORS, VehicleMapValue } from "./types";
import { labelForPlannerType } from "./utils";

interface CalendarSectionProps {
  currentMonth: Date;
  selectedDay: number | null;
  monthFilteredRows: PlannerRow[];
  vehicleMap: Map<string, VehicleMapValue>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (day: number) => void;
  onOpenAddEvent: (date: Date) => void;
}

export function CalendarSection({
  currentMonth,
  selectedDay,
  monthFilteredRows,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
}: CalendarSectionProps) {
  const monthLabel = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = useMemo(() => {
    return new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    ).getDate();
  }, [currentMonth]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    ).getDay();
  }, [currentMonth]);

  const calendarDays = useMemo(() => {
    const days: Array<{
      type: "prev" | "current" | "next";
      day: number;
      date: Date;
    }> = [];
    const totalDays = firstDayOfMonth + daysInMonth;
    const prevMonthDays = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      0,
    ).getDate();

    for (let i = 0; i < totalDays; i++) {
      if (i < firstDayOfMonth) {
        days.push({
          type: "prev",
          day: prevMonthDays - (firstDayOfMonth - i) + 1,
          date: new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() - 1,
            prevMonthDays - (firstDayOfMonth - i) + 1,
          ),
        });
      } else {
        const dayNum = i - firstDayOfMonth + 1;
        days.push({
          type: "current",
          day: dayNum,
          date: new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            dayNum,
          ),
        });
      }
    }

    while (days.length % 7 !== 0) {
      const nextDay: number = days.length - totalDays + 1;
      days.push({
        type: "next",
        day: nextDay,
        date: new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          nextDay,
        ),
      });
    }

    return days;
  }, [firstDayOfMonth, daysInMonth, currentMonth]);

  const dayRowsMap = useMemo(() => {
    const map = new Map<number, PlannerRow[]>();
    for (const row of monthFilteredRows) {
      const day = new Date(row.plannerDate).getDate();
      const existing = map.get(day);
      if (existing) existing.push(row);
      else map.set(day, [row]);
    }
    return map;
  }, [monthFilteredRows]);

  return (
    <div className="overflow-hidden bg-white shadow-xl">
      {/* Calendar Header */}
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{monthLabel}</h2>
          <div className="flex gap-2">
            <button
              onClick={onPrevMonth}
              className="rounded-lg border border-slate-300 bg-white p-2 transition-colors hover:bg-slate-50"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={onNextMonth}
              className="rounded-lg border border-slate-300 bg-white p-2 transition-colors hover:bg-slate-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-170">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="border-r border-slate-200 px-2 py-3 text-center text-xs font-semibold text-slate-600 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((cal, idx) => {
              const dayRowsData = dayRowsMap.get(cal.day);
              const isCurrentMonth = cal.type === "current";
              const isSelected = isCurrentMonth && cal.day === selectedDay;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (isCurrentMonth) {
                      onSelectDay(cal.day);
                    }
                  }}
                  className={`aspect-square border border-slate-200 p-2 text-left transition-all hover:bg-slate-50 ${
                    isCurrentMonth ? "bg-white" : "bg-slate-50"
                  } ${isSelected ? "ring-2 ring-blue-500 ring-inset" : ""}`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      isCurrentMonth ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {cal.day}
                  </p>

                  {dayRowsData && dayRowsData.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {dayRowsData.map((row) => {
                        const bgColor =
                          PLANNER_TYPE_COLORS[row.plannerType]?.dayBg;
                        const textColor =
                          PLANNER_TYPE_COLORS[row.plannerType]?.accent;

                        return (
                          <div
                            key={row._id}
                            className={`rounded px-1 py-0.5 text-xs font-medium ${bgColor} border ${textColor} truncate text-slate-800`}
                            title={labelForPlannerType(row.plannerType)}
                          >
                            {labelForPlannerType(row.plannerType)[0]}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 border-t border-slate-200 bg-slate-50 px-4 py-3">
        {Object.entries(EVENT_COLORS).map(([key, value]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${value.bg}`} />
            <span className="text-xs text-slate-600 capitalize">
              {key.replace("-", " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
